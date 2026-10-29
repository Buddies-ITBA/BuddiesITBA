import Link from 'next/link';
import { cn } from '@/lib/utils';

/*
 * Admin console primitives. The console is for the Buddies team (Spanish only).
 */

export const adminInput =
  'w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15';

export function PageHeader({ title, description, actions, back }: { title: string; description?: string; actions?: React.ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back && (
          <Link href={back.href} className="mb-2 inline-block text-sm text-text-muted hover:text-primary">
            ← {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, description, children, className }: { title?: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-2xl border bg-white p-5 shadow-xs md:p-6', className)}>
      {title && <h2 className="text-lg font-bold">{title}</h2>}
      {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      <div className={cn(title && 'mt-5')}>{children}</div>
    </section>
  );
}

const badgeTones = {
  neutral: 'bg-sky text-primary-dark',
  green: 'bg-emerald-100 text-emerald-800',
  amber: 'bg-amber-100 text-amber-900',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-700',
};

export function Badge({ tone = 'neutral', children }: { tone?: keyof typeof badgeTones; children: React.ReactNode }) {
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', badgeTones[tone])}>{children}</span>;
}

export function Field({ label, hint, htmlFor, children, className }: { label: string; hint?: string; htmlFor?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-heading">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

/** Spanish + English inputs side by side, named `${name}_es` / `${name}_en`. */
export function LocalizedInput({
  name,
  label,
  value,
  multiline,
  rows = 3,
  required,
  hint,
}: {
  name: string;
  label: string;
  value?: { es?: string; en?: string } | null;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  hint?: string;
}) {
  const Input = multiline ? 'textarea' : 'input';
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-sm font-semibold text-heading">{label}</legend>
      <div className="grid gap-3 md:grid-cols-2">
        {(['es', 'en'] as const).map((lang) => (
          <div key={lang} className="relative">
            <span className="pointer-events-none absolute right-2 top-2 rounded bg-sky px-1.5 text-[10px] font-bold uppercase text-primary">{lang}</span>
            <Input
              name={`${name}_${lang}`}
              aria-label={`${label} (${lang.toUpperCase()})`}
              defaultValue={value?.[lang] ?? ''}
              required={required && lang === 'es'}
              rows={multiline ? rows : undefined}
              className={cn(adminInput, 'pr-10')}
            />
          </div>
        ))}
      </div>
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
    </fieldset>
  );
}

export function Toggle({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-4 accent-primary" />
      <span>
        <span className="block text-sm font-semibold text-heading">{label}</span>
        {hint && <span className="block text-xs text-text-muted">{hint}</span>}
      </span>
    </label>
  );
}

export const th = 'px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-text-muted';
export const td = 'px-3 py-3 align-top text-sm';

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border bg-white shadow-xs">
      <table className="w-full min-w-[640px] divide-y">{children}</table>
    </div>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-10 text-center text-sm text-text-muted">
        {children}
      </td>
    </tr>
  );
}
