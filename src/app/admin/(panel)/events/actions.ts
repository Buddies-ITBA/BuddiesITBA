'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { refresh } from 'next/cache';
import { getDb, schema } from '@/db';
import { registrationTypes, registrationStatuses } from '@/db/schema';
import { requireAdmin } from '@/lib/auth/session';
import { fail, httpUrl, issuesMessage, ok, readBool, readInt, readLocalized, readString, type AdminState } from '@/lib/admin/state';
import { formFieldsSchema } from '@/lib/forms/schema';
import { isUniqueViolation } from '@/lib/forms/state';
import { fromDateTimeInput } from '@/lib/dates';
import { slugify } from '@/lib/text';
import { fillFromWaitlist, setRegistrationStatus } from '@/lib/registrations';

const eventInput = z.object({
  title: z.object({ es: z.string().min(1, 'El título en español es obligatorio'), en: z.string() }),
  summary: z.object({ es: z.string(), en: z.string() }),
  body: z.object({ es: z.string(), en: z.string() }),
  slug: z
    .string()
    .regex(/^[a-z0-9-]{2,80}$/, 'URL inválida (solo minúsculas, números y guiones)')
    .refine((s) => s !== 'cancel', 'Esa URL está reservada'),
  startsAt: z.date({ error: 'Fecha y hora obligatorias' }),
  location: z.string().max(200),
  imageUrl: z.string().max(500).nullable(),
  exchangeOnly: z.boolean(),
  published: z.boolean(),
  showInHome: z.boolean(),
  homeOrder: z.number().int(),
  registrationType: z.enum(registrationTypes),
  registrationUrl: httpUrl('Link de inscripción inválido').nullable(),
  registrationDeadline: z.date().nullable(),
  capacity: z.number().int().positive('El cupo tiene que ser mayor a 0').nullable(),
  formFields: formFieldsSchema,
});

export async function saveEvent(id: string | null, _prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  let formFields: unknown;
  try {
    formFields = JSON.parse(readString(fd, 'formFields') || '[]');
  } catch {
    return fail('El formulario de inscripción no es válido');
  }
  const title = readLocalized(fd, 'title');
  const registrationType = readString(fd, 'registrationType');
  const parsed = eventInput.safeParse({
    title,
    summary: readLocalized(fd, 'summary'),
    body: readLocalized(fd, 'body'),
    slug: readString(fd, 'slug') || slugify(title.es),
    startsAt: fromDateTimeInput(readString(fd, 'startsAt')) ?? undefined,
    location: readString(fd, 'location'),
    imageUrl: readString(fd, 'imageUrl') || null,
    exchangeOnly: readBool(fd, 'exchangeOnly'),
    published: readBool(fd, 'published'),
    showInHome: readBool(fd, 'showInHome'),
    homeOrder: readInt(fd, 'homeOrder') ?? 0,
    registrationType,
    registrationUrl: registrationType === 'link' ? readString(fd, 'registrationUrl') || null : null,
    registrationDeadline: fromDateTimeInput(readString(fd, 'registrationDeadline')),
    capacity: readInt(fd, 'capacity'),
    formFields,
  });
  if (!parsed.success) return fail(issuesMessage(parsed.error.issues));
  if (parsed.data.registrationType === 'link' && !parsed.data.registrationUrl) return fail('Falta el link de inscripción');

  const db = await getDb();
  try {
    if (id) {
      await db.update(schema.events).set(parsed.data).where(eq(schema.events.id, id));
    } else {
      const [created] = await db.insert(schema.events).values(parsed.data).returning({ id: schema.events.id });
      redirect(`/admin/events/${created.id}?created=1`);
    }
  } catch (error) {
    if (isUniqueViolation(error)) return fail('Ya existe otro evento con esa URL');
    throw error;
  }
  // A higher (or removed) capacity frees spots for people on the waitlist
  const promoted = id ? await fillFromWaitlist(id) : 0;
  refresh();
  return ok(promoted ? `Evento guardado. ${promoted} persona(s) pasaron de la lista de espera a confirmadas (se les avisó por email).` : 'Evento guardado');
}

/** Draft copy (with its form) for recurring events; dates and copy are edited after. */
export async function duplicateEvent(id: string) {
  await requireAdmin();
  const db = await getDb();
  const [source] = await db.select().from(schema.events).where(eq(schema.events.id, id)).limit(1);
  if (!source) return;
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, slug, title, ...rest } = source;
  let copySlug = `${slug}-copia`;
  for (let n = 2; (await db.select({ id: schema.events.id }).from(schema.events).where(eq(schema.events.slug, copySlug))).length; n++) {
    copySlug = `${slug}-copia-${n}`;
  }
  const [copy] = await db
    .insert(schema.events)
    .values({
      ...rest,
      slug: copySlug,
      title: { es: `${title.es} (copia)`, en: title.en ? `${title.en} (copy)` : '' },
      published: false,
      showInHome: false,
    })
    .returning({ id: schema.events.id });
  redirect(`/admin/events/${copy.id}?duplicated=1`);
}

export async function deleteEvent(id: string) {
  await requireAdmin();
  const db = await getDb();
  await db.delete(schema.events).where(eq(schema.events.id, id));
  redirect('/admin/events');
}

const status = z.enum(registrationStatuses);

/** Cancelling a confirmed person automatically lets the next one in from the waitlist (and emails them). */
export async function changeRegistrationStatus(registrationId: string, fd: FormData) {
  await requireAdmin();
  const parsed = status.safeParse(fd.get('status'));
  if (!parsed.success) return;
  await setRegistrationStatus(registrationId, parsed.data);
  refresh();
}

export async function deleteRegistration(registrationId: string) {
  await requireAdmin();
  const db = await getDb();
  await db.delete(schema.eventRegistrations).where(eq(schema.eventRegistrations.id, registrationId));
  refresh();
}
