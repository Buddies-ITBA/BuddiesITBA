'use client';

import { useId } from 'react';
import type { LocalizedField } from '@/lib/forms/localize';

export const inputClass =
  'w-full rounded-xl border bg-white px-4 py-2.5 text-base shadow-sm outline-none transition placeholder:text-text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-destructive';

export type FieldLabels = { optional: string; selectPlaceholder: string };

/** Label + help + error wrapper used by every field. Groups (radios/checkboxes) use fieldset/legend. */
export function FieldShell({
  label,
  help,
  error,
  required,
  optionalLabel,
  htmlFor,
  asGroup,
  children,
}: {
  label: string;
  help?: string;
  error?: string;
  required: boolean;
  optionalLabel: string;
  htmlFor?: string;
  asGroup?: boolean;
  children: React.ReactNode;
}) {
  const Label = asGroup ? 'legend' : 'label';
  const Wrapper = asGroup ? 'fieldset' : 'div';
  return (
    <Wrapper className="space-y-2">
      <Label htmlFor={asGroup ? undefined : htmlFor} className="block font-semibold text-heading">
        {label}
        {!required && <span className="ml-1.5 text-sm font-normal text-text-muted">({optionalLabel})</span>}
      </Label>
      {help && <p className="text-sm text-text-muted">{help}</p>}
      {children}
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </Wrapper>
  );
}

const pill =
  'inline-block rounded-full border bg-white px-4 py-2 text-sm font-medium transition peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-primary/25 hover:border-primary/50';

/** Pill-style checkbox/radio group, shared by multiselect fields and fixed form questions. */
export function ChoicePills({
  name,
  type,
  options,
  required,
}: {
  name: string;
  type: 'checkbox' | 'radio';
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label key={o.value} className="cursor-pointer">
          <input type={type} name={name} value={o.value} required={type === 'radio' && required} className="peer sr-only" />
          <span className={pill}>{o.label}</span>
        </label>
      ))}
    </div>
  );
}

/** Renders one admin-defined field. Inputs are named `q_<id>` (see lib/forms/validate.ts). */
export function DynamicField({ field, error, labels }: { field: LocalizedField; error?: string; labels: FieldLabels }) {
  const id = useId();
  const name = `q_${field.id}`;
  const invalid = error ? true : undefined;
  const shell = (children: React.ReactNode, asGroup = false) => (
    <FieldShell
      label={field.label}
      help={field.help}
      error={error}
      required={field.required}
      optionalLabel={labels.optional}
      htmlFor={id}
      asGroup={asGroup}
    >
      {children}
    </FieldShell>
  );

  switch (field.type) {
    case 'textarea':
      return shell(<textarea id={id} name={name} required={field.required} rows={4} maxLength={2000} aria-invalid={invalid} className={inputClass} />);
    case 'select':
      return shell(
        <select id={id} name={name} required={field.required} defaultValue="" aria-invalid={invalid} className={inputClass}>
          <option value="" disabled>
            {labels.selectPlaceholder}
          </option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case 'multiselect':
      return shell(<ChoicePills name={name} type="checkbox" options={field.options ?? []} />, true);
    case 'scale': {
      const { min = 1, max = 5, minLabel, maxLabel } = field.scale ?? {};
      const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      return shell(
        <div>
          <div className="flex gap-2">
            {steps.map((value) => (
              <label key={value} className="flex-1 cursor-pointer">
                <input type="radio" name={name} value={value} required={field.required} className="peer sr-only" />
                <span className="grid h-11 place-items-center rounded-xl border bg-white font-semibold transition peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-primary/25 hover:border-primary/50">
                  {value}
                </span>
              </label>
            ))}
          </div>
          {(minLabel || maxLabel) && (
            <div className="mt-1.5 flex justify-between gap-4 text-xs text-text-muted">
              <span>{minLabel}</span>
              <span className="text-right">{maxLabel}</span>
            </div>
          )}
        </div>,
        true
      );
    }
    case 'checkbox':
      return (
        <div className="space-y-1">
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" name={name} required={field.required} className="mt-1 size-4 accent-primary" />
            <span className="text-text">{field.label}</span>
          </label>
          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}
        </div>
      );
    default: {
      const type = { email: 'email', phone: 'tel', number: 'number', date: 'date' }[field.type as string] ?? 'text';
      return shell(<input id={id} name={name} type={type} required={field.required} maxLength={200} aria-invalid={invalid} className={inputClass} />);
    }
  }
}
