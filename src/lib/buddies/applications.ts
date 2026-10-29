import 'server-only';
import { z } from 'zod';
import { getDb, schema } from '@/db';
import { genders, genderPreferences, type BuddyRole, type BuddyProgramRow } from '@/db/schema';
import type { FormField } from '@/lib/forms/schema';
import { parseAnswers } from '@/lib/forms/validate';
import { isCountryCode } from '@/lib/countries';
import { isUniqueViolation } from '@/lib/forms/state';
import { sendEmail } from '@/lib/email/send';
import { applicationReceivedEmail } from '@/lib/email/templates';

export const LANGUAGE_CODES = ['es', 'en', 'pt', 'fr', 'de', 'it'] as const;

/** Questions a given role sees: shared ones plus their role-specific ones. */
export function questionsFor(program: Pick<BuddyProgramRow, 'questions'>, role: BuddyRole): FormField[] {
  return program.questions.filter((q) => !q.audience || q.audience === 'both' || q.audience === role);
}

const core = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  phone: z.string().trim().min(6).max(40),
  institution: z.string().trim().min(2).max(160),
  country: z.string().refine(isCountryCode, 'country'),
  gender: z.enum(genders),
  genderPreference: z.enum(genderPreferences),
  languages: z.array(z.enum(LANGUAGE_CODES)).min(1),
  capacity: z.coerce.number().int().min(1).max(3),
});

export type ApplicationResult =
  | { ok: true }
  | { ok: false; reason: 'invalid'; errors: string[] }
  | { ok: false; reason: 'duplicate' | 'closed' };

export async function submitApplication(
  program: BuddyProgramRow,
  role: BuddyRole,
  formData: FormData,
  locale = 'es'
): Promise<ApplicationResult> {
  if (!program.active || !program.registrationOpen) return { ok: false, reason: 'closed' };

  const parsed = core.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    institution: formData.get('institution'),
    country: role === 'local' ? formData.get('country') || 'AR' : formData.get('country'),
    gender: formData.get('gender'),
    genderPreference: formData.get('genderPreference') ?? 'any',
    languages: formData.getAll('languages'),
    capacity: role === 'local' ? formData.get('capacity') : 1,
  });
  const consented = formData.get('consent') === 'on';
  const answers = parseAnswers(questionsFor(program, role), formData);

  const errors = [
    ...(parsed.success ? [] : parsed.error.issues.map((i) => String(i.path[0]))),
    ...(consented ? [] : ['consent']),
    ...(answers.ok ? [] : Object.keys(answers.errors)),
  ];
  if (!parsed.success || !answers.ok || !consented) return { ok: false, reason: 'invalid', errors };

  const data = parsed.data;
  const db = await getDb();
  try {
    await db.insert(schema.buddyApplicants).values({
      ...data,
      email: data.email.toLowerCase(),
      programId: program.id,
      role,
      answers: answers.answers,
      locale,
    });
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, reason: 'duplicate' };
    throw error;
  }
  await sendEmail(await applicationReceivedEmail({ name: data.name, email: data.email, locale }, program.name));
  return { ok: true };
}
