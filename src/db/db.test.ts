import { describe, expect, it } from 'vitest';
import { count } from 'drizzle-orm';
import { getDb, schema } from './index';

describe('local database', () => {
  it('migrates and seeds an embedded database from scratch', async () => {
    const db = await getDb();
    const [{ value: events }] = await db.select({ value: count() }).from(schema.events);
    const [{ value: admins }] = await db.select({ value: count() }).from(schema.admins);
    expect(events).toBeGreaterThan(0);
    expect(admins).toBe(1);
  });
});
