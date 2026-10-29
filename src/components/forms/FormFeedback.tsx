'use client';

import { useFormStatus } from 'react-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FormState } from '@/lib/forms/state';

export function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending && <Loader2 className="animate-spin" />}
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function FormSuccess({ message }: { message: string }) {
  return (
    <div role="status" className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
      <CheckCircle2 className="mx-auto size-12 text-emerald-600" aria-hidden />
      <p className="mt-4 text-lg font-semibold text-emerald-900">{message}</p>
    </div>
  );
}

export function FormError({ state }: { state: FormState }) {
  if (state.status !== 'error' || !state.message) return null;
  return (
    <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
      {state.message}
    </p>
  );
}

/** Invisible to people, tempting to bots. Submissions with it filled are dropped. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
