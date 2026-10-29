'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { refresh } from 'next/cache';
import { getDb, schema } from '@/db';
import { requireAdmin } from '@/lib/auth/session';
import { fail, httpUrl, issuesMessage, ok, readBool, readInt, readLocalized, readString, type AdminState } from '@/lib/admin/state';
import { isUniqueViolation } from '@/lib/forms/state';
import { slugify } from '@/lib/text';
import { isCountryCode } from '@/lib/countries';

/* FAQ, team members and blog posts: plain CRUD from the admin console. */

const required = (label: string) => z.object({ es: z.string().min(1, `${label} en español es obligatorio`), en: z.string() });
const optional = z.object({ es: z.string(), en: z.string() });

const faqInput = z.object({
  question: required('La pregunta'),
  answer: required('La respuesta'),
  category: optional,
  sortOrder: z.number().int(),
  published: z.boolean(),
});

export async function saveFaq(id: string | null, _prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const parsed = faqInput.safeParse({
    question: readLocalized(fd, 'question'),
    answer: readLocalized(fd, 'answer'),
    category: readLocalized(fd, 'category'),
    sortOrder: readInt(fd, 'sortOrder') ?? 0,
    published: readBool(fd, 'published'),
  });
  if (!parsed.success) return fail(issuesMessage(parsed.error.issues));
  const db = await getDb();
  if (id) await db.update(schema.faqs).set(parsed.data).where(eq(schema.faqs.id, id));
  else {
    await db.insert(schema.faqs).values(parsed.data);
    redirect('/admin/faq');
  }
  refresh();
  return ok();
}

export async function deleteFaq(id: string) {
  await requireAdmin();
  await (await getDb()).delete(schema.faqs).where(eq(schema.faqs.id, id));
  redirect('/admin/faq');
}

const teamInput = z.object({
  name: z.string().min(2, 'Falta el nombre'),
  role: required('El rol'),
  career: optional,
  bio: optional,
  imageUrl: z.string().max(500).nullable(),
  linkedinUrl: httpUrl('LinkedIn inválido').nullable(),
  sortOrder: z.number().int(),
  active: z.boolean(),
});

export async function saveTeamMember(id: string | null, _prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const parsed = teamInput.safeParse({
    name: readString(fd, 'name'),
    role: readLocalized(fd, 'role'),
    career: readLocalized(fd, 'career'),
    bio: readLocalized(fd, 'bio'),
    imageUrl: readString(fd, 'imageUrl') || null,
    linkedinUrl: readString(fd, 'linkedinUrl') || null,
    sortOrder: readInt(fd, 'sortOrder') ?? 0,
    active: readBool(fd, 'active'),
  });
  if (!parsed.success) return fail(issuesMessage(parsed.error.issues));
  const db = await getDb();
  if (id) await db.update(schema.teamMembers).set(parsed.data).where(eq(schema.teamMembers.id, id));
  else {
    await db.insert(schema.teamMembers).values(parsed.data);
    redirect('/admin/team');
  }
  refresh();
  return ok();
}

export async function deleteTeamMember(id: string) {
  await requireAdmin();
  await (await getDb()).delete(schema.teamMembers).where(eq(schema.teamMembers.id, id));
  redirect('/admin/team');
}

const postInput = z.object({
  title: required('El título'),
  excerpt: optional,
  body: optional,
  category: optional,
  slug: z.string().regex(/^[a-z0-9-]{2,80}$/, 'URL inválida'),
  coverUrl: z.string().max(500).nullable(),
  authorName: z.string().min(1),
  publishedAt: z.date(),
  published: z.boolean(),
});

export async function savePost(id: string | null, _prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const title = readLocalized(fd, 'title');
  const date = readString(fd, 'publishedAt');
  const parsed = postInput.safeParse({
    title,
    excerpt: readLocalized(fd, 'excerpt'),
    body: readLocalized(fd, 'body'),
    category: readLocalized(fd, 'category'),
    slug: readString(fd, 'slug') || slugify(title.es),
    coverUrl: readString(fd, 'coverUrl') || null,
    authorName: readString(fd, 'authorName') || 'Buddies ITBA',
    publishedAt: date ? new Date(`${date}T12:00:00-03:00`) : new Date(),
    published: readBool(fd, 'published'),
  });
  if (!parsed.success) return fail(issuesMessage(parsed.error.issues));
  const db = await getDb();
  try {
    if (id) await db.update(schema.posts).set(parsed.data).where(eq(schema.posts.id, id));
    else {
      const [created] = await db.insert(schema.posts).values(parsed.data).returning({ id: schema.posts.id });
      redirect(`/admin/blog/${created.id}`);
    }
  } catch (error) {
    if (isUniqueViolation(error)) return fail('Ya existe otro post con esa URL');
    throw error;
  }
  refresh();
  return ok();
}

export async function deletePost(id: string) {
  await requireAdmin();
  await (await getDb()).delete(schema.posts).where(eq(schema.posts.id, id));
  redirect('/admin/blog');
}

const testimonialInput = z.object({
  name: z.string().min(2, 'Falta el nombre'),
  countryCode: z.string().refine(isCountryCode, 'País inválido').nullable(),
  subtitle: optional,
  quote: required('La cita'),
  imageUrl: z.string().max(500).nullable(),
  sortOrder: z.number().int(),
  published: z.boolean(),
});

export async function saveTestimonial(id: string | null, _prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const parsed = testimonialInput.safeParse({
    name: readString(fd, 'name'),
    countryCode: readString(fd, 'countryCode') || null,
    subtitle: readLocalized(fd, 'subtitle'),
    quote: readLocalized(fd, 'quote'),
    imageUrl: readString(fd, 'imageUrl') || null,
    sortOrder: readInt(fd, 'sortOrder') ?? 0,
    published: readBool(fd, 'published'),
  });
  if (!parsed.success) return fail(issuesMessage(parsed.error.issues));
  const db = await getDb();
  if (id) await db.update(schema.testimonials).set(parsed.data).where(eq(schema.testimonials.id, id));
  else {
    await db.insert(schema.testimonials).values(parsed.data);
    redirect('/admin/testimonials');
  }
  refresh();
  return ok();
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();
  await (await getDb()).delete(schema.testimonials).where(eq(schema.testimonials.id, id));
  redirect('/admin/testimonials');
}

const photoInput = z.object({
  imageUrl: z.string().min(1, 'Subí una imagen').max(500),
  caption: optional,
  sortOrder: z.number().int(),
  published: z.boolean(),
});

export async function saveGalleryPhoto(id: string | null, _prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const parsed = photoInput.safeParse({
    imageUrl: readString(fd, 'imageUrl'),
    caption: readLocalized(fd, 'caption'),
    sortOrder: readInt(fd, 'sortOrder') ?? 0,
    published: id ? readBool(fd, 'published') : true,
  });
  if (!parsed.success) return fail(issuesMessage(parsed.error.issues));
  const db = await getDb();
  if (id) await db.update(schema.galleryPhotos).set(parsed.data).where(eq(schema.galleryPhotos.id, id));
  else await db.insert(schema.galleryPhotos).values(parsed.data);
  refresh();
  return ok(id ? 'Foto actualizada' : 'Foto agregada');
}

export async function deleteGalleryPhoto(id: string) {
  await requireAdmin();
  await (await getDb()).delete(schema.galleryPhotos).where(eq(schema.galleryPhotos.id, id));
  refresh();
}

const MAX_STATS = 6;

export async function saveSiteSettings(_prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const stats = Array.from({ length: MAX_STATS }, (_, i) => ({
    value: readInt(fd, `stat_${i}_value`),
    label: readLocalized(fd, `stat_${i}_label`),
  }))
    .filter((s) => s.value !== null && s.label.es)
    .map((s) => ({ value: s.value as number, label: s.label }));
  const whatsappUrl = readString(fd, 'whatsappUrl') || null;
  const parsedUrl = httpUrl('Link de WhatsApp inválido').nullable().safeParse(whatsappUrl);
  if (!parsedUrl.success) return fail(issuesMessage(parsedUrl.error.issues));
  const db = await getDb();
  await db
    .insert(schema.siteSettings)
    .values({ id: 'main', stats, whatsappUrl: parsedUrl.data })
    .onConflictDoUpdate({ target: schema.siteSettings.id, set: { stats, whatsappUrl: parsedUrl.data } });
  refresh();
  return ok('Configuración guardada');
}
