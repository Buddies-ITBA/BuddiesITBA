import { z } from 'zod';

/**
 * Form definitions built in the admin console. Used for event registration
 * forms and buddy program questionnaires. Stored as JSON in the database.
 */

const localized = z.object({ es: z.string().trim().min(1), en: z.string().trim().optional() });
const optionalLocalized = z.object({ es: z.string().trim(), en: z.string().trim().optional() });

export const fieldTypes = [
  'text',
  'textarea',
  'email',
  'phone',
  'number',
  'date',
  'select',
  'multiselect',
  'scale',
  'checkbox',
] as const;
export type FieldType = (typeof fieldTypes)[number];

export const audiences = ['both', 'local', 'exchange'] as const;
export type Audience = (typeof audiences)[number];

export const formFieldSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9_-]{1,40}$/, 'id inválido'),
    type: z.enum(fieldTypes),
    label: localized,
    help: optionalLocalized.optional(),
    required: z.boolean(),
    options: z.array(z.object({ value: z.string().min(1), label: localized })).optional(),
    scale: z
      .object({
        min: z.number().int(),
        max: z.number().int(),
        minLabel: optionalLocalized.optional(),
        maxLabel: optionalLocalized.optional(),
      })
      .refine((s) => s.max > s.min, 'max debe ser mayor que min')
      .optional(),
    /** Buddy program only: who sees the question. */
    audience: z.enum(audiences).optional(),
    /** Buddy program only: 0 = informative, 1-5 = importance for matching. */
    matchWeight: z.number().int().min(0).max(5).optional(),
  })
  .superRefine((field, ctx) => {
    if ((field.type === 'select' || field.type === 'multiselect') && !field.options?.length) {
      ctx.addIssue({ code: 'custom', message: `"${field.label.es}" necesita opciones` });
    }
    if (field.type === 'scale' && !field.scale) {
      ctx.addIssue({ code: 'custom', message: `"${field.label.es}" necesita rango` });
    }
  });

export type FormField = z.infer<typeof formFieldSchema>;

export const formFieldsSchema = z
  .array(formFieldSchema)
  .refine((fields) => new Set(fields.map((f) => f.id)).size === fields.length, 'Hay preguntas con id repetido');

export type Answers = Record<string, string | string[] | number | boolean>;

/** Fields that can feed the matching algorithm. */
export const matchableTypes: FieldType[] = ['select', 'multiselect', 'scale'];
