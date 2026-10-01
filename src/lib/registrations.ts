import 'server-only';
import { and, count, eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import type { Answers } from '@/lib/forms/schema';
import { isUniqueViolation } from '@/lib/forms/state';

const { events, eventRegistrations } = schema;

export type RegistrationResult = 'confirmed' | 'waitlist' | 'duplicate' | 'closed' | 'not_found';

export function isRegistrationOpen(event: Pick<schema.EventRow, 'registrationType' | 'registrationDeadline' | 'startsAt'>, now = new Date()) {
  if (event.registrationType !== 'form') return false;
  const closesAt = event.registrationDeadline ?? event.startsAt;
  return now < closesAt;
}

/**
 * Registers someone for a form-based event. The event row is locked for the
 * duration of the transaction so two people can't take the last spot.
 * When full, people go to the waitlist instead of being rejected.
 */
export async function registerForEvent(input: {
  eventId: string;
  name: string;
  email: string;
  answers: Answers;
}): Promise<RegistrationResult> {
  const db = await getDb();
  try {
    return await db.transaction(async (tx) => {
      const [event] = await tx
        .select()
        .from(events)
        .where(and(eq(events.id, input.eventId), eq(events.published, true)))
        .for('update');
      if (!event) return 'not_found';
      if (!isRegistrationOpen(event)) return 'closed';

      const [{ value: confirmed }] = await tx
        .select({ value: count() })
        .from(eventRegistrations)
        .where(and(eq(eventRegistrations.eventId, event.id), eq(eventRegistrations.status, 'confirmed')));
      const status = event.capacity !== null && confirmed >= event.capacity ? 'waitlist' : 'confirmed';

      await tx.insert(eventRegistrations).values({
        eventId: event.id,
        name: input.name,
        email: input.email.toLowerCase(),
        answers: input.answers,
        status,
      });
      return status;
    });
  } catch (error) {
    if (isUniqueViolation(error)) return 'duplicate';
    throw error;
  }
}
