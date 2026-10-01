import 'server-only';
import { and, asc, eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import type { BuddyApplicantRow, BuddyProgramRow } from '@/db/schema';
import { assignBuddies, compatibility, type Candidate, type MatchQuestion } from '@/lib/matching';
import { matchableTypes, type FormField } from '@/lib/forms/schema';
import { pick } from '@/lib/localized';

export async function getProgram(id: string) {
  const db = await getDb();
  const [program] = await db.select().from(schema.buddyPrograms).where(eq(schema.buddyPrograms.id, id)).limit(1);
  return program ?? null;
}

export async function getProgramData(programId: string) {
  const db = await getDb();
  const [applicants, matches] = await Promise.all([
    db.select().from(schema.buddyApplicants).where(eq(schema.buddyApplicants.programId, programId)).orderBy(asc(schema.buddyApplicants.createdAt)),
    db.select().from(schema.buddyMatches).where(eq(schema.buddyMatches.programId, programId)),
  ]);
  return { applicants, matches };
}

/** Questions that feed the algorithm: weighted, comparable, answered by both groups. */
export function matchingQuestions(program: Pick<BuddyProgramRow, 'questions'>): MatchQuestion[] {
  return program.questions.filter(
    (q) => (q.matchWeight ?? 0) > 0 && matchableTypes.includes(q.type) && (q.audience ?? 'both') === 'both'
  );
}

export const toCandidate = (a: BuddyApplicantRow): Candidate => ({
  id: a.id,
  gender: a.gender,
  genderPreference: a.genderPreference,
  languages: a.languages,
  capacity: a.role === 'local' ? a.capacity : undefined,
  answers: a.answers,
});

/**
 * Re-runs the algorithm for a program: keeps locked matches, replaces the rest.
 * Returns how many people were matched and how many were left out.
 */
export async function runMatching(program: BuddyProgramRow) {
  const db = await getDb();
  const { applicants, matches } = await getProgramData(program.id);
  const locals = applicants.filter((a) => a.role === 'local').map(toCandidate);
  const exchanges = applicants.filter((a) => a.role === 'exchange').map(toCandidate);
  const locked = matches.filter((m) => m.locked);

  const result = assignBuddies({ locals, exchanges, questions: matchingQuestions(program), locked });

  await db.transaction(async (tx) => {
    await tx.delete(schema.buddyMatches).where(and(eq(schema.buddyMatches.programId, program.id), eq(schema.buddyMatches.locked, false)));
    const fresh = result.matches.filter((m) => !m.locked);
    if (fresh.length) {
      await tx.insert(schema.buddyMatches).values(fresh.map((m) => ({ programId: program.id, localId: m.localId, exchangeId: m.exchangeId, score: m.score })));
    }
  });
  return { matched: result.matches.length, unassigned: result.unassigned.length };
}

/** Short Spanish explanation of why two people match, for the admin table. */
export function matchReasons(program: BuddyProgramRow, local: BuddyApplicantRow, exchange: BuddyApplicantRow): string[] {
  const questions = matchingQuestions(program);
  const byId = new Map<string, FormField>(program.questions.map((q) => [q.id, q]));
  const c = compatibility(toCandidate(local), toCandidate(exchange), questions);
  const reasons: string[] = [];
  if (c.sharedLanguages.length) reasons.push(`Idiomas: ${c.sharedLanguages.join(', ').toUpperCase()}`);
  for (const item of [...c.breakdown].sort((a, b) => b.similarity - a.similarity)) {
    const q = byId.get(item.questionId);
    if (!q || item.similarity < 0.5) continue;
    if (item.shared?.length) {
      const labels = item.shared.map((v) => pick(q.options?.find((o) => o.value === v)?.label, 'es') || v);
      reasons.push(`${pick(q.label, 'es')}: ${labels.join(', ')}`);
    } else if (q.type === 'scale' && item.similarity >= 0.75) {
      reasons.push(`Parecidos en "${pick(q.label, 'es')}"`);
    }
  }
  return reasons.slice(0, 4);
}
