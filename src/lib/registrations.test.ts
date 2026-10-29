import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';

// Emails are tested separately; here we only care who gets which one.
const sent: { kind: string; to: string; cancelToken: string | null }[] = [];
vi.mock('@/lib/email/templates', () => ({
  registrationEmail: async (kind: string, person: { email: string }, _event: unknown, cancelToken: string | null) => {
    sent.push({ kind, to: person.email, cancelToken });
    return { to: person.email, subject: kind, html: '', text: '', kind };
  },
}));
vi.mock('@/lib/email/send', () => ({ sendEmail: async () => true }));

const { cancelByToken, fillFromWaitlist, isRegistrationOpen, registerForEvent, setRegistrationStatus } = await import('./registrations');

let eventId: string;

async function createEvent(capacity: number | null) {
  const db = await getDb();
  const [event] = await db
    .insert(schema.events)
    .values({
      slug: `test-${Math.random().toString(36).slice(2)}`,
      title: { es: 'Test' },
      startsAt: new Date(Date.now() + 86_400_000),
      published: true,
      registrationType: 'form',
      capacity,
    })
    .returning();
  return event.id;
}

async function statusOf(email: string) {
  const db = await getDb();
  const rows = await db.select().from(schema.eventRegistrations).where(eq(schema.eventRegistrations.eventId, eventId));
  return rows.find((r) => r.email === email)?.status;
}

const register = (email: string) => registerForEvent({ eventId, name: 'Ana Test', email, answers: {} });

beforeEach(() => {
  sent.length = 0;
});

describe('registerForEvent', () => {
  beforeAll(async () => {
    eventId = await createEvent(2);
  });

  it('confirms until capacity, then waitlists, emailing each person', async () => {
    expect(await register('a@x.com')).toBe('confirmed');
    expect(await register('b@x.com')).toBe('confirmed');
    expect(await register('c@x.com')).toBe('waitlist');
    expect(sent.map((e) => [e.to, e.kind])).toEqual([
      ['a@x.com', 'confirmed'],
      ['b@x.com', 'confirmed'],
      ['c@x.com', 'waitlist'],
    ]);
    expect(sent.every((e) => e.cancelToken && e.cancelToken.length > 20)).toBe(true);
  });

  it('rejects duplicate emails case-insensitively', async () => {
    expect(await register('A@X.com')).toBe('duplicate');
  });

  it('handles unknown events', async () => {
    expect(await registerForEvent({ eventId: '00000000-0000-0000-0000-000000000000', name: 'x', email: 'x@x.com', answers: {} })).toBe('not_found');
  });
});

describe('cancellation and waitlist promotion', () => {
  beforeAll(async () => {
    eventId = await createEvent(1);
  });

  it('cancelling via the emailed link frees the spot for the first person waiting', async () => {
    await register('first@x.com');
    await register('second@x.com');
    await register('third@x.com');
    const token = sent.find((e) => e.to === 'first@x.com')!.cancelToken!;
    sent.length = 0;

    expect(await cancelByToken(token)).toBe(true);
    expect(await statusOf('first@x.com')).toBe('cancelled');
    expect(await statusOf('second@x.com')).toBe('confirmed');
    expect(await statusOf('third@x.com')).toBe('waitlist');
    expect(sent).toEqual([{ kind: 'promoted', to: 'second@x.com', cancelToken: null }]);
  });

  it('a used or bogus token does nothing', async () => {
    expect(await cancelByToken('nope')).toBe(false);
  });

  it('raising the capacity lets waitlisted people in', async () => {
    const db = await getDb();
    await db.update(schema.events).set({ capacity: 5 }).where(eq(schema.events.id, eventId));
    expect(await fillFromWaitlist(eventId)).toBe(1);
    expect(await statusOf('third@x.com')).toBe('confirmed');
  });

  it('moving a waitlisted person around never promotes anyone', async () => {
    const db = await getDb();
    await db.update(schema.events).set({ capacity: 1 }).where(eq(schema.events.id, eventId));
    await register('fourth@x.com'); // full → waitlist
    const [row] = await db.select().from(schema.eventRegistrations).where(eq(schema.eventRegistrations.email, 'fourth@x.com'));
    sent.length = 0;
    const result = await setRegistrationStatus(row.id, 'cancelled');
    expect(result?.promoted).toEqual([]);
    expect(sent).toEqual([]);
  });
});

describe('isRegistrationOpen', () => {
  const base = { registrationType: 'form' as const, startsAt: new Date('2030-01-10'), registrationDeadline: null };
  it('closes at the deadline, or at the start when there is none', () => {
    expect(isRegistrationOpen(base, new Date('2030-01-09'))).toBe(true);
    expect(isRegistrationOpen(base, new Date('2030-01-11'))).toBe(false);
    expect(isRegistrationOpen({ ...base, registrationDeadline: new Date('2030-01-05') }, new Date('2030-01-06'))).toBe(false);
  });

  it('is never open for non-form events', () => {
    expect(isRegistrationOpen({ ...base, registrationType: 'whatsapp' }, new Date('2030-01-01'))).toBe(false);
  });
});
