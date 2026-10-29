'use server';

import { z } from 'zod';
import { and, eq, ne } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { refresh } from 'next/cache';
import { getDb, schema } from '@/db';
import { requireAdmin } from '@/lib/auth/session';
import { fail, issuesMessage, ok, readBool, readString, type AdminState } from '@/lib/admin/state';
import { getProgram, runMatching, sendIntroductions } from '@/lib/admin/buddies';
import { emailEnabled } from '@/lib/email/send';
import { defaultBuddyQuestions } from '@/lib/buddies/default-questions';
import { formFieldsSchema, matchableTypes, type FormField } from '@/lib/forms/schema';
import { compatibility } from '@/lib/matching';
import { matchingQuestions, toCandidate } from '@/lib/admin/buddies';

export async function createProgram(_prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const name = readString(fd, 'name');
  if (name.length < 3) return fail('Poné un nombre, ej: "2027 · 1er cuatrimestre"');
  const copyFrom = readString(fd, 'copyFrom');
  const source = copyFrom && copyFrom !== 'default' ? await getProgram(copyFrom) : null;
  const db = await getDb();
  const [program] = await db
    .insert(schema.buddyPrograms)
    .values({ name, questions: source?.questions ?? defaultBuddyQuestions })
    .returning({ id: schema.buddyPrograms.id });
  redirect(`/admin/buddies/${program.id}?tab=settings`);
}

export async function updateProgramSettings(id: string, _prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const name = readString(fd, 'name');
  if (name.length < 3) return fail('El nombre es muy corto');
  const active = readBool(fd, 'active');
  const db = await getDb();
  await db.transaction(async (tx) => {
    // Only one program is shown on the public page
    if (active) await tx.update(schema.buddyPrograms).set({ active: false }).where(ne(schema.buddyPrograms.id, id));
    await tx
      .update(schema.buddyPrograms)
      .set({ name, active, registrationOpen: active && readBool(fd, 'registrationOpen') })
      .where(eq(schema.buddyPrograms.id, id));
  });
  refresh();
  return ok('Programa actualizado');
}

/** Weights only make sense for comparable questions both groups answer. */
function normalizeQuestions(fields: FormField[]): FormField[] {
  return fields.map((f) => {
    const audience = f.audience ?? 'both';
    const matchable = matchableTypes.includes(f.type) && audience === 'both';
    return { ...f, audience, matchWeight: matchable ? (f.matchWeight ?? 0) : 0 };
  });
}

export async function saveQuestions(id: string, _prev: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  let raw: unknown;
  try {
    raw = JSON.parse(readString(fd, 'questions') || '[]');
  } catch {
    return fail('Las preguntas no son válidas');
  }
  const parsed = formFieldsSchema.safeParse(raw);
  if (!parsed.success) return fail(issuesMessage(parsed.error.issues));
  const db = await getDb();
  await db.update(schema.buddyPrograms).set({ questions: normalizeQuestions(parsed.data) }).where(eq(schema.buddyPrograms.id, id));
  refresh();
  return ok('Preguntas guardadas');
}

export async function deleteProgram(id: string) {
  await requireAdmin();
  await (await getDb()).delete(schema.buddyPrograms).where(eq(schema.buddyPrograms.id, id));
  redirect('/admin/buddies');
}

export async function deleteApplicant(id: string) {
  await requireAdmin();
  await (await getDb()).delete(schema.buddyApplicants).where(eq(schema.buddyApplicants.id, id));
  refresh();
}

export async function saveApplicantNotes(id: string, fd: FormData) {
  await requireAdmin();
  await (await getDb()).update(schema.buddyApplicants).set({ notes: readString(fd, 'notes').slice(0, 2000) }).where(eq(schema.buddyApplicants.id, id));
  refresh();
}

export async function generateMatches(programId: string): Promise<AdminState> {
  await requireAdmin();
  const program = await getProgram(programId);
  if (!program) return fail('Programa no encontrado');
  const { matched, unassigned } = await runMatching(program);
  refresh();
  return ok(
    `Propuesta generada: ${matched} matches${unassigned ? `, ${unassigned} sin buddy (falta capacidad o hay restricciones)` : ''}. Bloqueá los que te gusten antes de volver a correrlo.`
  );
}

export async function introduceMatches(programId: string): Promise<AdminState> {
  await requireAdmin();
  const { introduced, failed } = await sendIntroductions(programId);
  refresh();
  if (!introduced && !failed) return ok('No hay matches nuevos para presentar.');
  const note = emailEnabled() ? '' : ' (emails no configurados: quedaron registrados en el log, no se enviaron)';
  return failed
    ? fail(`Se presentaron ${introduced} pares, pero ${failed} fallaron. Revisá el log de emails.`)
    : ok(`Listo: se presentaron ${introduced} pares por email${note}.`);
}

export async function toggleMatchLock(matchId: string) {
  await requireAdmin();
  const db = await getDb();
  const [match] = await db.select().from(schema.buddyMatches).where(eq(schema.buddyMatches.id, matchId)).limit(1);
  if (match) await db.update(schema.buddyMatches).set({ locked: !match.locked }).where(eq(schema.buddyMatches.id, matchId));
  refresh();
}

export async function removeMatch(matchId: string) {
  await requireAdmin();
  await (await getDb()).delete(schema.buddyMatches).where(eq(schema.buddyMatches.id, matchId));
  refresh();
}

export async function clearUnlockedMatches(programId: string) {
  await requireAdmin();
  await (await getDb()).delete(schema.buddyMatches).where(and(eq(schema.buddyMatches.programId, programId), eq(schema.buddyMatches.locked, false)));
  refresh();
}

const manual = z.object({ exchangeId: z.uuid(), localId: z.uuid() });

/** Assign by hand: replaces the exchange student's current match with a locked one. */
export async function assignManually(programId: string, fd: FormData) {
  await requireAdmin();
  const parsed = manual.safeParse({ exchangeId: fd.get('exchangeId'), localId: fd.get('localId') });
  if (!parsed.success) return;
  const program = await getProgram(programId);
  if (!program) return;
  const db = await getDb();
  const people = await db.select().from(schema.buddyApplicants).where(eq(schema.buddyApplicants.programId, programId));
  const local = people.find((p) => p.id === parsed.data.localId && p.role === 'local');
  const exchange = people.find((p) => p.id === parsed.data.exchangeId && p.role === 'exchange');
  if (!local || !exchange) return;
  const score = compatibility(toCandidate(local), toCandidate(exchange), matchingQuestions(program)).score;
  await db.transaction(async (tx) => {
    await tx.delete(schema.buddyMatches).where(eq(schema.buddyMatches.exchangeId, exchange.id));
    await tx.insert(schema.buddyMatches).values({ programId, localId: local.id, exchangeId: exchange.id, score, locked: true });
  });
  refresh();
}

