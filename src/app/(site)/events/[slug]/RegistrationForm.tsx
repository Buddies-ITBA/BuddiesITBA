'use client';

import { useActionState } from 'react';
import { DynamicField, FieldShell, inputClass } from '@/components/forms/fields';
import { FormError, FormSuccess, Honeypot, SubmitButton } from '@/components/forms/FormFeedback';
import type { LocalizedField } from '@/lib/forms/localize';
import { initialFormState } from '@/lib/forms/state';
import { submitEventRegistration } from './actions';

type Labels = {
  name: string;
  email: string;
  consent: string;
  submit: string;
  submitting: string;
  optional: string;
  selectPlaceholder: string;
};

export function RegistrationForm({ slug, fields, labels }: { slug: string; fields: LocalizedField[]; labels: Labels }) {
  const [state, action] = useActionState(submitEventRegistration.bind(null, slug), initialFormState);

  if (state.status === 'success') return <FormSuccess message={state.message ?? ''} />;

  return (
    <form action={action} noValidate={false} className="relative space-y-6">
      <Honeypot />
      <FieldShell label={labels.name} required optionalLabel={labels.optional} htmlFor="reg-name" error={state.errors?.name}>
        <input id="reg-name" name="name" required autoComplete="name" maxLength={120} className={inputClass} aria-invalid={!!state.errors?.name || undefined} />
      </FieldShell>
      <FieldShell label={labels.email} required optionalLabel={labels.optional} htmlFor="reg-email" error={state.errors?.email}>
        <input id="reg-email" name="email" type="email" required autoComplete="email" maxLength={200} className={inputClass} aria-invalid={!!state.errors?.email || undefined} />
      </FieldShell>

      {fields.map((field) => (
        <DynamicField key={field.id} field={field} error={state.errors?.[field.id]} labels={labels} />
      ))}

      <label className="flex cursor-pointer items-start gap-3 text-sm text-text-muted">
        <input type="checkbox" name="consent" required className="mt-0.5 size-4 accent-primary" />
        <span>{labels.consent}</span>
      </label>

      <FormError state={state} />
      <SubmitButton label={labels.submit} pendingLabel={labels.submitting} />
    </form>
  );
}
