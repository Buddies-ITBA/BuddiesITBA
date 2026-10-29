/** Returned by admin server actions to <AdminForm>. */
export type AdminState = { status: 'idle' | 'success' | 'error'; message?: string };
export const idle: AdminState = { status: 'idle' };
export const ok = (message = 'Guardado'): AdminState => ({ status: 'success', message });
export const fail = (message: string): AdminState => ({ status: 'error', message });

/** Formats zod issues as a short Spanish message for admins. */
export function issuesMessage(issues: { path: PropertyKey[]; message: string }[]): string {
  return issues
    .slice(0, 5)
    .map((i) => (i.path.length ? `${i.path.join('.')}: ${i.message}` : i.message))
    .join(' · ');
}

const str = (fd: FormData, key: string) => String(fd.get(key) ?? '').trim();

/** Reads `${prefix}_es` / `${prefix}_en` inputs into a Localized object. */
export function readLocalized(fd: FormData, prefix: string) {
  return { es: str(fd, `${prefix}_es`), en: str(fd, `${prefix}_en`) };
}

export const readString = str;
export const readBool = (fd: FormData, key: string) => fd.get(key) === 'on';
export function readInt(fd: FormData, key: string): number | null {
  const value = str(fd, key);
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

import { z } from 'zod';

/** http(s) URLs only — keeps `javascript:` and friends out of public links. */
export const httpUrl = (message: string) => z.url({ protocol: /^https?$/, error: message });
