'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { getDb, schema } from '@/db';
import { requireAdmin } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
import { fail, issuesMessage, ok, readString, type AdminState } from '@/lib/admin/state';
import { isUniqueViolation } from '@/lib/forms/state';

const input = z.object({
  name: z.string().min(2, 'Falta el nombre'),
  email: z.email('Email inválido'),
  password: z.string().min(10, 'La contraseña tiene que tener al menos 10 caracteres'),
});

export async function createAdmin(_prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const parsed = input.safeParse({ name: readString(fd, 'name'), email: readString(fd, 'email').toLowerCase(), password: String(fd.get('password') ?? '') });
  if (!parsed.success) return fail(issuesMessage(parsed.error.issues));
  try {
    await (await getDb()).insert(schema.admins).values({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
    });
  } catch (error) {
    if (isUniqueViolation(error)) return fail('Ya existe un admin con ese email');
    throw error;
  }
  refresh();
  return ok(`Listo: ${parsed.data.email} ya puede ingresar`);
}

export async function changeOwnPassword(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const me = await requireAdmin();
  const password = String(fd.get('password') ?? '');
  if (password.length < 10) return fail('La contraseña tiene que tener al menos 10 caracteres');
  await (await getDb()).update(schema.admins).set({ passwordHash: await hashPassword(password) }).where(eq(schema.admins.id, me.id));
  return ok('Contraseña actualizada');
}

export async function deleteAdmin(id: string) {
  const me = await requireAdmin();
  if (id === me.id) return; // can't remove yourself
  await (await getDb()).delete(schema.admins).where(eq(schema.admins.id, id));
  refresh();
}
