import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { and, eq, gt } from 'drizzle-orm';
import { getDb, schema } from '@/db';

const COOKIE = 'buddies_admin';
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export async function createSession(adminId: string) {
  const token = randomBytes(32).toString('base64url');
  const db = await getDb();
  await db.insert(schema.sessions).values({
    id: hashToken(token),
    adminId,
    expiresAt: new Date(Date.now() + MAX_AGE_SECONDS * 1000),
  });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.delete(schema.sessions).where(eq(schema.sessions.id, hashToken(token)));
  }
  store.delete(COOKIE);
}

/** The signed-in admin, or null. Deduplicated per request. */
export const getCurrentAdmin = cache(async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const [row] = await db
    .select({ id: schema.admins.id, email: schema.admins.email, name: schema.admins.name })
    .from(schema.sessions)
    .innerJoin(schema.admins, eq(schema.admins.id, schema.sessions.adminId))
    .where(and(eq(schema.sessions.id, hashToken(token)), gt(schema.sessions.expiresAt, new Date())))
    .limit(1);
  return row ?? null;
});

/** Use at the top of every admin page and server action. */
export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}
