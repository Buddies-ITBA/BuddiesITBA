'use client';

import { useActionState } from 'react';
import { ChoicePills, DynamicField, FieldShell, inputClass } from '@/components/forms/fields';
import { FormError, FormSuccess, Honeypot, SubmitButton } from '@/components/forms/FormFeedback';
import type { BuddyRole } from '@/db/schema';
import type { LocalizedField } from '@/lib/forms/localize';
import { initialFormState } from '@/lib/forms/state';
import { applyToProgram } from './actions';

type Option = { value: string; label: string };

export type ApplicationLabels = {
  sectionAbout: string;
  sectionMatching: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  country: string;
  gender: string;
  genderPreference: string;
  languages: string;
  capacity: string;
  consent: string;
  submit: string;
  submitting: string;
  optional: string;
  selectPlaceholder: string;
};

export function ApplicationForm({
  role,
  questions,
  labels,
  genders,
  genderPreferences,
  languages,
}: {
  role: BuddyRole;
  questions: LocalizedField[];
  labels: ApplicationLabels;
  genders: Option[];
  genderPreferences: Option[];
  languages: Option[];
}) {
  const [state, action] = useActionState(applyToProgram.bind(null, role), initialFormState);
  if (state.status === 'success') return <FormSuccess message={state.message ?? ''} />;

  const err = (key: string) => state.errors?.[key];
  const text = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <FieldShell label={label} required optionalLabel={labels.optional} htmlFor={`app-${name}`} error={err(name)}>
      <input id={`app-${name}`} name={name} required maxLength={160} className={inputClass} aria-invalid={!!err(name) || undefined} {...props} />
    </FieldShell>
  );

  return (
    <form action={action} className="relative space-y-12">
      <Honeypot />
      <fieldset className="space-y-6">
        <legend className="mb-6 text-2xl font-bold text-heading">{labels.sectionAbout}</legend>
        <div className="grid gap-6 md:grid-cols-2">
          {text('name', labels.name, { autoComplete: 'name' })}
          {text('email', labels.email, { type: 'email', autoComplete: 'email' })}
          {text('phone', labels.phone, { type: 'tel', autoComplete: 'tel', placeholder: '+54 9 11 …' })}
          {text('institution', labels.institution)}
          {role === 'exchange' && text('country', labels.country, { autoComplete: 'country-name' })}
          <FieldShell label={labels.gender} required optionalLabel={labels.optional} htmlFor="app-gender" error={err('gender')}>
            <select id="app-gender" name="gender" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                {labels.selectPlaceholder}
              </option>
              {genders.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </FieldShell>
        </div>
        <FieldShell label={labels.genderPreference} required optionalLabel={labels.optional} asGroup error={err('genderPreference')}>
          <ChoicePills name="genderPreference" type="radio" options={genderPreferences} required />
        </FieldShell>
        <FieldShell label={labels.languages} required optionalLabel={labels.optional} asGroup error={err('languages')}>
          <ChoicePills name="languages" type="checkbox" options={languages} />
        </FieldShell>
        {role === 'local' && (
          <FieldShell label={labels.capacity} required optionalLabel={labels.optional} asGroup error={err('capacity')}>
            <ChoicePills name="capacity" type="radio" options={['1', '2', '3'].map((v) => ({ value: v, label: v }))} required />
          </FieldShell>
        )}
      </fieldset>

      {questions.length > 0 && (
        <fieldset className="space-y-8">
          <legend className="mb-6 text-2xl font-bold text-heading">{labels.sectionMatching}</legend>
          {questions.map((field) => (
            <DynamicField key={field.id} field={field} error={err(field.id)} labels={labels} />
          ))}
        </fieldset>
      )}

      <div className="space-y-6 border-t pt-8">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-text-muted">
          <input type="checkbox" name="consent" required className="mt-0.5 size-4 accent-primary" />
          <span>{labels.consent}</span>
        </label>
        <FormError state={state} />
        <SubmitButton label={labels.submit} pendingLabel={labels.submitting} />
      </div>
    </form>
  );
}
