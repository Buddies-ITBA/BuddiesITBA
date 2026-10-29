import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { and, asc, count, eq, ne } from 'drizzle-orm';
import { getDb, schema, type DB } from '@/db';
import type { Answers } from '@/lib/forms/schema';
import { isUniqueViolation } from '@/lib/forms/state';
import { pick } from '@/lib/localized';
import { sendEmail } from '@/lib/email/send';
import { registrationEmail } from '@/lib/email/templates';

const { events, eventRegistrations } = schema;
type Tx = Parameters<Parameters<DB['transaction']>[0]>[0];

export type RegistrationResult = 'confirmed' | 'waitlist' | 'duplicate' | 'closed' | 'not_found';

export function isRegistrationOpen(event: Pick<schema.EventRow, 'registrationType' | 'registrationDeadline' | 'startsAt'>, now = new Date()) {
  if (event.registrationType !== 'form') return false;
  const closesAt = event.registrationDeadline ?? event.startsAt;
  return now < closesAt;
}

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

/** Locks the event row so capacity checks and promotions can't race. */
async function lockEvent(tx: Tx, eventId: string) {
  const [event] = await tx.select().from(events).where(eq(events.id, eventId)).for('update');
  return event ?? null;
}

async function confirmedCount(tx: Tx, eventId: string) {
  const [{ value }] = await tx
    .select({ value: count() })
    .from(eventRegistrations)
    .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.status, 'confirmed')));
  return value;
}

/**
 * Moves people from the waitlist to confirmed (oldest first) while there is
 * room. Call inside a transaction that already locked the event.
 */
async function promoteFromWaitlist(tx: Tx, event: schema.EventRow) {
  if (event.capacity === null) {
    // No limit any more: everyone waiting gets in.
    return tx
      .update(eventRegistrations)
      .set({ status: 'confirmed' })
      .where(and(eq(eventRegistrations.eventId, event.id), eq(eventRegistrations.status, 'waitlist')))
      .returning();
  }
  const free = event.capacity - (await confirmedCount(tx, event.id));
  if (free <= 0) return [];
  const waiting = await tx
    .select({ id: eventRegistrations.id })
    .from(eventRegistrations)
    .where(and(eq(eventRegistrations.eventId, event.id), eq(eventRegistrations.status, 'waitlist')))
    .orderBy(asc(eventRegistrations.createdAt))
    .limit(free);
  const promoted: schema.RegistrationRow[] = [];
  for (const { id } of waiting) {
    const [row] = await tx.update(eventRegistrations).set({ status: 'confirmed' }).where(eq(eventRegistrations.id, id)).returning();
    promoted.push(row);
  }
  return promoted;
}

const eventInfo = (event: schema.EventRow, locale: string) => ({
  title: pick(event.title, locale === 'en' ? 'en' : 'es'),
  slug: event.slug,
  startsAt: event.startsAt,
  location: event.location,
});

async function notifyPromoted(event: schema.EventRow, promoted: schema.RegistrationRow[]) {
  // Promoted people keep their original cancel link from the first email.
  await Promise.all(promoted.map(async (r) => sendEmail(await registrationEmail('promoted', r, eventInfo(event, r.locale), null))));
}

/**
 * Registers someone for a form-based event. When full, people go to the
 * waitlist instead of being rejected. Sends a confirmation (or waitlist)
 * email with a personal cancellation link.
 */
export async function registerForEvent(input: {
  eventId: string;
  name: string;
  email: string;
  answers: Answers;
  locale?: string;
}): Promise<RegistrationResult> {
  const db = await getDb();
  const cancelToken = randomBytes(24).toString('base64url');
  let outcome: { status: 'confirmed' | 'waitlist'; event: schema.EventRow } | RegistrationResult;
  try {
    outcome = await db.transaction(async (tx) => {
      const event = await lockEvent(tx, input.eventId);
      if (!event || !event.published) return 'not_found' as const;
      if (!isRegistrationOpen(event)) return 'closed' as const;

      const full = event.capacity !== null && (await confirmedCount(tx, event.id)) >= event.capacity;
      const status = full ? ('waitlist' as const) : ('confirmed' as const);
      await tx.insert(eventRegistrations).values({
        eventId: event.id,
        name: input.name,
        email: input.email.toLowerCase(),
        answers: input.answers,
        status,
        locale: input.locale ?? 'es',
        cancelTokenHash: hashToken(cancelToken),
      });
      return { status, event };
    });
  } catch (error) {
    if (isUniqueViolation(error)) return 'duplicate';
    throw error;
  }
  if (typeof outcome === 'string') return outcome;

  const person = { name: input.name, email: input.email, locale: input.locale ?? 'es' };
  await sendEmail(await registrationEmail(outcome.status, person, eventInfo(outcome.event, person.locale), cancelToken));
  return outcome.status;
}

/** Looks up an active registration by its emailed cancel token (for the confirm page). */
export async function findByCancelToken(token: string) {
  if (!token || token.length > 100) return null;
  const db = await getDb();
  const [row] = await db
    .select({ registration: eventRegistrations, event: events })
    .from(eventRegistrations)
    .innerJoin(events, eq(events.id, eventRegistrations.eventId))
    .where(and(eq(eventRegistrations.cancelTokenHash, hashToken(token)), ne(eventRegistrations.status, 'cancelled')))
    .limit(1);
  return row ?? null;
}

/** Self-service cancellation from the email link. Frees the spot for the waitlist. */
export async function cancelByToken(token: string): Promise<boolean> {
  const found = await findByCancelToken(token);
  if (!found) return false;
  return (await setRegistrationStatus(found.registration.id, 'cancelled')) !== null;
}

/**
 * Changes a registration's status (admin or self-service) and, if that freed
 * a spot, promotes the next people on the waitlist and emails them.
 */
export async function setRegistrationStatus(registrationId: string, status: schema.RegistrationRow['status']) {
  const db = await getDb();
  const result = await db.transaction(async (tx) => {
    const [current] = await tx.select().from(eventRegistrations).where(eq(eventRegistrations.id, registrationId)).limit(1);
    if (!current) return null;
    const event = await lockEvent(tx, current.eventId);
    if (!event) return null;
    await tx.update(eventRegistrations).set({ status }).where(eq(eventRegistrations.id, registrationId));
    const promoted = current.status === 'confirmed' && status !== 'confirmed' ? await promoteFromWaitlist(tx, event) : [];
    return { event, promoted };
  });
  if (result?.promoted.length) await notifyPromoted(result.event, result.promoted);
  return result;
}

/** After an admin raises (or removes) the capacity, let waitlisted people in. */
export async function fillFromWaitlist(eventId: string) {
  const db = await getDb();
  const result = await db.transaction(async (tx) => {
    const event = await lockEvent(tx, eventId);
    if (!event || event.registrationType !== 'form') return null;
    return { event, promoted: await promoteFromWaitlist(tx, event) };
  });
  if (result?.promoted.length) await notifyPromoted(result.event, result.promoted);
  return result?.promoted.length ?? 0;
}
