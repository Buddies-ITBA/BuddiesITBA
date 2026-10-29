import 'server-only';
import { and, eq, gt, isNull, lte } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { pick } from '@/lib/localized';
import { sendEmail } from '@/lib/email/send';
import { registrationEmail } from '@/lib/email/templates';

const HOUR = 60 * 60 * 1000;
/** Run once a day: covers everything starting in the next 36h, so no event is skipped. */
export const REMINDER_WINDOW_HOURS = 36;

/**
 * Emails confirmed attendees of form-registration events starting soon.
 * Each event is claimed (reminder_sent_at) before sending, so overlapping
 * runs never double-send. Returns what was sent, per event.
 */
export async function sendDueReminders(now = new Date()) {
  const db = await getDb();
  const due = await db
    .select()
    .from(schema.events)
    .where(
      and(
        eq(schema.events.published, true),
        eq(schema.events.registrationType, 'form'),
        isNull(schema.events.reminderSentAt),
        gt(schema.events.startsAt, now),
        lte(schema.events.startsAt, new Date(now.getTime() + REMINDER_WINDOW_HOURS * HOUR))
      )
    );

  const results: { eventId: string; title: string; sent: number }[] = [];
  for (const event of due) {
    const claimed = await db
      .update(schema.events)
      .set({ reminderSentAt: now })
      .where(and(eq(schema.events.id, event.id), isNull(schema.events.reminderSentAt)))
      .returning({ id: schema.events.id });
    if (!claimed.length) continue; // another run got it

    const attendees = await db
      .select()
      .from(schema.eventRegistrations)
      .where(and(eq(schema.eventRegistrations.eventId, event.id), eq(schema.eventRegistrations.status, 'confirmed')));

    let sent = 0;
    for (const person of attendees) {
      const info = { title: pick(event.title, person.locale === 'en' ? 'en' : 'es'), slug: event.slug, startsAt: event.startsAt, location: event.location };
      if (await sendEmail(await registrationEmail('reminder', person, info, null))) sent++;
    }
    results.push({ eventId: event.id, title: pick(event.title, 'es'), sent });
  }
  return results;
}
