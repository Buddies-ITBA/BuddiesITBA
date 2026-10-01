import type { LucideIcon } from 'lucide-react';
import { FlightPath } from '@/components/brand/flight-path';

type StatusMessageProps = {
  Icon: LucideIcon;
  title: string;
  description: string;
  footnote?: string;
  children?: React.ReactNode;
};

/** Centered icon + message + actions, shared by error and not-found pages. */
export function StatusMessage({ Icon, title, description, footnote, children }: StatusMessageProps) {
  return (
    <div className="container-page relative flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <FlightPath className="mb-2 w-56" />
      <span className="grid size-16 place-items-center rounded-2xl bg-sky text-primary">
        <Icon className="size-8" aria-hidden />
      </span>
      <h1 className="mt-6 text-3xl font-bold md:text-4xl">{title}</h1>
      <p className="mt-3 max-w-md text-text-muted">{description}</p>
      {footnote && <p className="mt-2 text-xs text-text-muted/80">{footnote}</p>}
      {children && <div className="mt-8 flex flex-col gap-3 sm:flex-row">{children}</div>}
    </div>
  );
}
