import type { LucideIcon } from 'lucide-react';

type EmptyStateProps = {
  Icon: LucideIcon;
  title: string;
  hint?: string;
  children?: React.ReactNode;
};

/** Dashed card shown when a list (events, posts, search results) is empty. */
export function EmptyState({ Icon, title, hint, children }: EmptyStateProps) {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-dashed border-plane/50 bg-white p-10 text-center">
      <Icon className="mx-auto size-12 text-plane" aria-hidden />
      <p className="mt-4 text-lg font-semibold text-heading">{title}</p>
      {hint && <p className="mt-1 text-sm text-text-muted">{hint}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
