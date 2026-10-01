'use server';

import { getLocale, getTranslations } from 'next-intl/server';
import { buddyRoles, type BuddyRole } from '@/db/schema';
import { getActiveProgram } from '@/lib/data/public';
import { submitApplication } from '@/lib/buddies/applications';
import type { FormState } from '@/lib/forms/state';

export async function applyToProgram(role: BuddyRole, _prev: FormState, formData: FormData): Promise<FormState> {
  const [t, tApply] = await Promise.all([getTranslations('forms'), getTranslations('buddies.apply')]);
  if (formData.get('website')) return { status: 'success', message: tApply('success') };

  const program = await getActiveProgram();
  if (!program || !buddyRoles.includes(role)) return { status: 'error', message: t('genericError') };

  const result = await submitApplication(program, role, formData, await getLocale());
  if (result.ok) return { status: 'success', message: tApply('success') };
  if (result.reason === 'duplicate') return { status: 'error', message: tApply('duplicate'), errors: { email: tApply('duplicate') } };
  if (result.reason === 'invalid') {
    return { status: 'error', message: t('errorSummary'), errors: Object.fromEntries(result.errors.map((k) => [k, t('invalid')])) };
  }
  return { status: 'error', message: t('genericError') };
}
