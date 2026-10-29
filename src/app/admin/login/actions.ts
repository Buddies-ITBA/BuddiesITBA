'use server';

import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getDb, schema } from '@/db';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, destroySession } from '@/lib/auth/session';
import { fail, type AdminState } from '@/lib/admin/state';

export async function login(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const db = await getDb();
  const [admin] = await db.select().from(schema.admins).where(eq(schema.admins.email, email)).limit(1);

  const valid = admin ? await verifyPassword(password, admin.passwordHash) : false;
  if (!admin || !valid) {
    // Slow down guessing a little; same response for unknown email and bad password
    await new Promise((resolve) => setTimeout(resolve, 600));
    return fail('Email o contraseña incorrectos');
  }

  await createSession(admin.id);
  redirect('/admin');
}

export async function logout() {
  await destroySession();
  redirect('/admin/login');
}
