/**
 * All events happen in Buenos Aires, so we always display times in that zone.
 * This also keeps server and client output identical (no hydration mismatch
 * when the server runs in UTC and the visitor's browser does not).
 */
const TIME_ZONE = 'America/Argentina/Buenos_Aires';

const styles = {
  weekdayLong: { weekday: 'long', day: 'numeric', month: 'long' },
  monthYear: { month: 'long', year: 'numeric' },
  time: { hour: '2-digit', minute: '2-digit' },
  long: { day: 'numeric', month: 'long', year: 'numeric' },
  badge: { weekday: 'short', day: 'numeric', month: 'short' },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

type Style = keyof typeof styles;

// Intl.DateTimeFormat is expensive to construct; reuse one per locale+style.
const formatters = new Map<string, Intl.DateTimeFormat>();
function formatter(locale: string, style: Style): Intl.DateTimeFormat {
  const key = `${locale}|${style}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, { ...styles[style], timeZone: TIME_ZONE });
    formatters.set(key, f);
  }
  return f;
}

/** Formats a date in Buenos Aires time, sentence-cased ("Martes, 6 de octubre"). */
export function formatEventDate(date: Date, locale: string, style: Exclude<Style, 'badge'>): string {
  const text = formatter(locale, style).format(date);
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}

/** Pieces for a calendar-style date badge: { weekday: 'dom', day: '15', month: 'mar' }. */
export function eventDateParts(date: Date, locale: string) {
  const parts = formatter(locale, 'badge').formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    (parts.find((p) => p.type === type)?.value ?? '').replace(/\.$/, '');
  return { weekday: get('weekday'), day: get('day'), month: get('month') };
}

/** Groups items by "Month year" in the event time zone, preserving order. */
export function groupByMonth<T>(items: T[], getDate: (item: T) => Date, locale: string) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = formatEventDate(getDate(item), locale, 'monthYear');
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.entries()].map(([month, entries]) => ({ month, entries }));
}

/*
 * Admin forms use <input type="datetime-local">, which has no time zone.
 * Values are always Buenos Aires time (UTC-3; Argentina has no DST).
 */
const BA_OFFSET = '-03:00';

export function toDateTimeInput(date: Date | null | undefined): string {
  if (!date) return '';
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function fromDateTimeInput(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00${BA_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date;
}
