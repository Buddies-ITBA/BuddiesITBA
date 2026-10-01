import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { eventDateParts } from '@/lib/dates';

export function ExchangeOnlyBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-sun/20 px-2.5 py-0.5 text-xs font-semibold text-[#6b4a00]',
        className
      )}
    >
      <Sparkles className="size-3" aria-hidden />
      {label}
    </span>
  );
}

/** Calendar-page style date block: weekday / day / month. */
export function DateBadge({ date, locale, className }: { date: Date; locale: string; className?: string }) {
  const { weekday, day, month } = eventDateParts(date, locale);
  return (
    <div
      className={cn(
        'flex w-16 shrink-0 flex-col items-center overflow-hidden rounded-xl bg-white text-center shadow-sm ring-1 ring-border',
        className
      )}
    >
      <span className="w-full bg-primary py-0.5 font-nav text-[10px] font-semibold uppercase tracking-wider text-white">
        {weekday}
      </span>
      <span className="font-heading text-2xl font-extrabold leading-tight text-heading">{day}</span>
      <span className="pb-1 font-nav text-xs font-medium uppercase text-text-muted">{month}</span>
    </div>
  );
}
