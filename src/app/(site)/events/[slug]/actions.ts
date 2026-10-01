'use server';

import { z } from 'zod';
import { getLocale, getTranslations } from 'next-intl/server';
import { refresh } from 'next/cache';
import { getEventBySlug } from '@/lib/data/public';
import { parseAnswers } from '@/lib/forms/validate';
import type { FormState } from '@/lib/forms/state';
import { registerForEvent } from '@/lib/registrations';

const contact = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  consent: z.literal('on'),
});

export async function submitEventRegistration(slug: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const t = await getTranslations('forms');
  // Bots fill every field; people never see this one.
  if (formData.get('website')) return { status: 'success', message: t('success') };

  const event = await getEventBySlug(slug, await getLocale());
  if (!event) return { status: 'error', message: t('genericError') };

  const errors: Record<string, string> = {};
  const parsedContact = contact.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    consent: formData.get('consent'),
  });
  if (!parsedContact.success) {
    for (const issue of parsedContact.error.issues) errors[String(issue.path[0])] = t('invalid');
  }
  const parsedAnswers = parseAnswers(event.formFields, formData);
  if (!parsedAnswers.ok) {
    for (const key of Object.keys(parsedAnswers.errors)) errors[key] = t('invalid');
  }
  if (!parsedContact.success || !parsedAnswers.ok) {
    return { status: 'error', message: t('errorSummary'), errors };
  }

  const result = await registerForEvent({
    eventId: event.id,
    name: parsedContact.data.name,
    email: parsedContact.data.email,
    answers: parsedAnswers.answers,
  });

  switch (result) {
    case 'confirmed':
      refresh();
      return { status: 'success', message: t('success') };
    case 'waitlist':
      return { status: 'success', message: t('successWaitlist') };
    case 'duplicate':
      return { status: 'error', message: t('duplicate'), errors: { email: t('duplicate') } };
    default:
      return { status: 'error', message: t('genericError') };
  }
}
