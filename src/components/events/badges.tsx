import { Clock, MapPin, Sparkles, Users } from 'lucide-react';
import type { PublicEvent } from '@/lib/data/public';
import { cn } from '@/lib/utils';
import { eventDateParts, formatEventDate } from '@/lib/dates';

export function ExchangeOnlyBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-sun/20 px-2.5 py-0.5 text-xs font-semibold text-sun-ink',
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

/** "Martes, 6 de octubre · 19:00 · Location · Capacity: 120" row with icons. */
export function EventMeta({
  event,
  locale,
  capacityLabel,
  className,
}: {
  event: Pick<PublicEvent, 'startsAt' | 'location' | 'capacity'>;
  locale: string;
  /** Shown (with the capacity) only when provided and the event has one. */
  capacityLabel?: string;
  className?: string;
}) {
  const items = [
    { Icon: Clock, text: `${formatEventDate(event.startsAt, locale, 'weekdayLong')} · ${formatEventDate(event.startsAt, locale, 'time')}` },
    event.location && { Icon: MapPin, text: event.location },
    capacityLabel && event.capacity && { Icon: Users, text: `${capacityLabel}: ${event.capacity}` },
  ].filter(Boolean) as Array<{ Icon: typeof Clock; text: string }>;

  return (
    <p className={cn('flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted', className)}>
      {items.map(({ Icon, text }) => (
        <span key={text} className="inline-flex items-center gap-1.5">
          <Icon className="size-3.5 text-primary" aria-hidden />
          {text}
        </span>
      ))}
    </p>
  );
}

export type Availability = { state: 'open' | 'lastSpots' | 'full' | 'closed'; count: number };

/** Registration status of a web-form event, or null when it doesn't apply. */
export function availabilityOf(event: Pick<PublicEvent, 'registrationType' | 'registrationOpen' | 'spotsLeft' | 'capacity'>): Availability | null {
  if (event.registrationType !== 'form') return null;
  if (!event.registrationOpen) return { state: 'closed', count: 0 };
  if (event.spotsLeft === null) return { state: 'open', count: 0 };
  if (event.spotsLeft === 0) return { state: 'full', count: 0 };
  // "Last spots" when ≤5 left, or ≤20% for big events
  const threshold = Math.max(5, Math.ceil((event.capacity ?? 0) * 0.2));
  return event.spotsLeft <= threshold ? { state: 'lastSpots', count: event.spotsLeft } : { state: 'open', count: 0 };
}

const availabilityTones = {
  open: 'bg-emerald-50 text-success ring-emerald-200',
  lastSpots: 'bg-sun/20 text-sun-ink ring-sun/50',
  full: 'bg-white text-text-muted ring-border',
  closed: 'bg-white text-text-muted ring-border',
};
const dotTones = { open: 'bg-success', lastSpots: 'bg-sun', full: 'bg-text-muted/50', closed: 'bg-text-muted/50' };

export function AvailabilityBadge({ state, label, className }: { state: Availability['state']; label: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1', availabilityTones[state], className)}>
      <span aria-hidden className={cn('size-1.5 rounded-full', dotTones[state])} />
      {label}
    </span>
  );
}
