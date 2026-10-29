'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { CheckCircle2, Loader2, TriangleAlert } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { idle, type AdminState } from '@/lib/admin/state';
import { cn } from '@/lib/utils';

type Action = (state: AdminState, formData: FormData) => Promise<AdminState>;

/** <form> bound to an admin server action, with a status banner. */
export function AdminForm({ action, children, className }: { action: Action; children: React.ReactNode; className?: string }) {
  const [state, formAction] = useActionState(action, idle);
  const banner = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status === 'error') banner.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [state]);

  return (
    <form action={formAction} className={cn('space-y-6', className)}>
      <div ref={banner} aria-live="polite">
        {state.status !== 'idle' && state.message && (
          <p
            className={cn(
              'flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-medium',
              state.status === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
            )}
          >
            {state.status === 'success' ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <TriangleAlert className="mt-0.5 size-4 shrink-0" />}
            {state.message}
          </p>
        )}
      </div>
      {children}
    </form>
  );
}

export function SaveButton({ children = 'Guardar', disabled, ...props }: ButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} {...props}>
      {pending && <Loader2 className="animate-spin" />}
      {children}
    </Button>
  );
}

/** Submit button that asks for confirmation first (for destructive actions). */
export function ConfirmButton({ message, children, ...props }: ButtonProps & { message: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
