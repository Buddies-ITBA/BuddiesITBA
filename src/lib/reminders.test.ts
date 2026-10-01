import { beforeAll, describe, expect, it, vi } from 'vitest';
import { getDb, schema } from '@/db';

const sent: { kind: string; to: string }[] = [];
vi.mock('@/lib/email/templates', () => ({
  registrationEmail: async (kind: string, person: { email: string }) => {
    sent.push({ kind, to: person.email });
    return { to: person.email, subject: kind, html: '', text: '', kind };
  },
}));
vi.mock('@/lib/email/send', () => ({ sendEmail: async () => true }));

const { sendDueReminders } = await import('./reminders');

const HOUR = 3_600_000;
const now = new Date('2031-06-01T12:00:00Z');

async function event(slug: string, startsInHours: number) {
  const db = await getDb();
  const [row] = await db
    .insert(schema.events)
    .values({ slug, title: { es: slug }, startsAt: new Date(now.getTime() + startsInHours * HOUR), published: true, registrationType: 'form' })
    .returning();
  await db.insert(schema.eventRegistrations).values([
    { eventId: row.id, name: 'Ok', email: `ok-${slug}@x.com`, status: 'confirmed' },
    { eventId: row.id, name: 'Wait', email: `wait-${slug}@x.com`, status: 'waitlist' },
    { eventId: row.id, name: 'Gone', email: `gone-${slug}@x.com`, status: 'cancelled' },
  ]);
}

describe('sendDueReminders', () => {
  beforeAll(async () => {
    await event('tomorrow', 20);
    await event('next-week', 24 * 7);
    await event('already-started', -1);
  });

  it('reminds confirmed attendees of events starting within 36h only', async () => {
    const results = await sendDueReminders(now);
    expect(results.map((r) => r.title)).toEqual(['tomorrow']);
    expect(sent).toEqual([{ kind: 'reminder', to: 'ok-tomorrow@x.com' }]);
  });

  it('never sends the same event twice', async () => {
    sent.length = 0;
    expect(await sendDueReminders(now)).toEqual([]);
    expect(sent).toEqual([]);
  });
});
