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
