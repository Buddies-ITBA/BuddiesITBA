import { beforeAll, describe, expect, it } from 'vitest';
import { getDb, schema } from '@/db';
import { isRegistrationOpen, registerForEvent } from './registrations';

let eventId: string;

beforeAll(async () => {
  const db = await getDb();
  const [event] = await db
    .insert(schema.events)
    .values({
      slug: 'test-capacity',
      title: { es: 'Test' },
      startsAt: new Date(Date.now() + 86_400_000),
      published: true,
      registrationType: 'form',
      capacity: 2,
    })
    .returning();
  eventId = event.id;
});

const register = (email: string) => registerForEvent({ eventId, name: 'Ana', email, answers: {} });

describe('registerForEvent', () => {
  it('confirms until capacity, then waitlists', async () => {
    expect(await register('a@x.com')).toBe('confirmed');
    expect(await register('b@x.com')).toBe('confirmed');
    expect(await register('c@x.com')).toBe('waitlist');
  });

  it('rejects duplicate emails case-insensitively', async () => {
    expect(await register('A@X.com')).toBe('duplicate');
  });

  it('handles unknown events', async () => {
    expect(await registerForEvent({ eventId: '00000000-0000-0000-0000-000000000000', name: 'x', email: 'x@x.com', answers: {} })).toBe('not_found');
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
