import type { Locale } from '@/i18n/config';
import { pick } from '@/lib/localized';
import type { FieldType, FormField } from './schema';

/** A FormField with text resolved for one locale — what public forms render. */
export type LocalizedField = {
  id: string;
  type: FieldType;
  label: string;
  help?: string;
  required: boolean;
  options?: { value: string; label: string }[];
  scale?: { min: number; max: number; minLabel?: string; maxLabel?: string };
};

export function localizeFields(fields: FormField[], locale: Locale): LocalizedField[] {
  return fields.map((field) => ({
    id: field.id,
    type: field.type,
    label: pick(field.label, locale),
    help: pick(field.help, locale) || undefined,
    required: field.required,
    options: field.options?.map((o) => ({ value: o.value, label: pick(o.label, locale) })),
    scale: field.scale && {
      min: field.scale.min,
      max: field.scale.max,
      minLabel: pick(field.scale.minLabel, locale) || undefined,
      maxLabel: pick(field.scale.maxLabel, locale) || undefined,
    },
  }));
}
