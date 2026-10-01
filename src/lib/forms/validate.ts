import { z } from 'zod';
import type { Answers, FormField } from './schema';

const MAX_TEXT = 2000;

function fieldValidator(field: FormField): z.ZodType {
  const optional = <T extends z.ZodType>(s: T) => (field.required ? s : s.optional());
  switch (field.type) {
    case 'text':
    case 'phone':
      return optional(z.string().trim().min(field.required ? 1 : 0).max(200));
    case 'textarea':
      return optional(z.string().trim().min(field.required ? 1 : 0).max(MAX_TEXT));
    case 'email':
      return field.required ? z.email() : z.email().optional();
    case 'number':
      return optional(z.coerce.number().finite());
    case 'date':
      return optional(z.string().regex(/^\d{4}-\d{2}-\d{2}$/));
    case 'select': {
      const values = field.options?.map((o) => o.value) ?? [];
      return optional(z.string().refine((v) => values.includes(v), 'Opción inválida'));
    }
    case 'multiselect': {
      const values = field.options?.map((o) => o.value) ?? [];
      const arr = z.array(z.string().refine((v) => values.includes(v), 'Opción inválida'));
      return field.required ? arr.min(1) : arr;
    }
    case 'scale': {
      const { min = 1, max = 5 } = field.scale ?? {};
      return optional(z.coerce.number().int().min(min).max(max));
    }
    case 'checkbox':
      return field.required ? z.literal(true) : z.boolean();
  }
}

/** Reads one field's raw value from FormData, shaped for its validator. */
function readField(formData: FormData, field: FormField): unknown {
  const name = `q_${field.id}`;
  if (field.type === 'multiselect') return formData.getAll(name).map(String);
  if (field.type === 'checkbox') return formData.get(name) === 'on';
  const raw = formData.get(name);
  if (raw === null || raw === '') return undefined;
  return String(raw);
}

export type FieldErrors = Record<string, string>;

/**
 * Validates a public submission against an admin-defined form.
 * Inputs are named `q_<fieldId>`; unknown inputs are ignored.
 */
export function parseAnswers(
  fields: FormField[],
  formData: FormData
): { ok: true; answers: Answers } | { ok: false; errors: FieldErrors } {
  const answers: Answers = {};
  const errors: FieldErrors = {};
  for (const field of fields) {
    const result = fieldValidator(field).safeParse(readField(formData, field));
    if (!result.success) {
      errors[field.id] = 'invalid';
    } else if (result.data !== undefined && result.data !== '') {
      answers[field.id] = result.data as Answers[string];
    }
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, answers };
}
