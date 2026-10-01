import 'server-only';
import { asc, eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import type { Answers, FormField } from '@/lib/forms/schema';
import { pick } from '@/lib/localized';

/** Human-readable answer (option labels instead of keys). */
export function formatAnswer(field: FormField, value: Answers[string] | undefined): string {
  if (value === undefined || value === null || value === '') return '';
  const label = (v: string) => pick(field.options?.find((o) => o.value === v)?.label, 'es') || v;
  if (Array.isArray(value)) return value.map(label).join(', ');
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (field.type === 'select') return label(String(value));
  return String(value);
}

export async function getEventWithRegistrations(eventId: string) {
  const db = await getDb();
  const [event] = await db.select().from(schema.events).where(eq(schema.events.id, eventId)).limit(1);
  if (!event) return null;
  const registrations = await db
    .select()
    .from(schema.eventRegistrations)
    .where(eq(schema.eventRegistrations.eventId, eventId))
    .orderBy(asc(schema.eventRegistrations.createdAt));
  return { event, registrations };
}

export const statusLabels = { confirmed: 'Confirmado', waitlist: 'En espera', cancelled: 'Cancelado' } as const;
