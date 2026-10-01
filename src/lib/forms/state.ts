/** Result of a public form submission, returned by server actions to useActionState. */
export type FormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  /** Field id (or "name"/"email"/…) → error text */
  errors?: Record<string, string>;
};

export const initialFormState: FormState = { status: 'idle' };

/** Postgres unique-violation, through drizzle's error wrapper or directly. */
export function isUniqueViolation(error: unknown): boolean {
  const code = (e: unknown) => (e && typeof e === 'object' && 'code' in e ? (e as { code: unknown }).code : undefined);
  return code(error) === '23505' || code((error as { cause?: unknown })?.cause) === '23505';
}
