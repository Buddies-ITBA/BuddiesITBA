/**
 * All events happen in Buenos Aires, so we always display times in that zone.
 * This also keeps server and client output identical (no hydration mismatch
 * when the server runs in UTC and the visitor's browser does not).
 */
export const EVENT_TIME_ZONE = 'America/Argentina/Buenos_Aires';

const options = {
  weekdayLong: { weekday: 'long', day: 'numeric', month: 'long' },
  monthYear: { month: 'long', year: 'numeric' },
  time: { hour: '2-digit', minute: '2-digit' },
  long: { day: 'numeric', month: 'long', year: 'numeric' },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export function formatEventDate(
  date: Date,
  locale: string,
  style: keyof typeof options
): string {
  const text = new Intl.DateTimeFormat(locale, { ...options[style], timeZone: EVENT_TIME_ZONE }).format(date);
  // Sentence case: "martes, 6 de octubre" → "Martes, 6 de octubre"
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}

/** Pieces for a calendar-style date badge: { weekday: 'sáb', day: '15', month: 'mar' }. */
export function eventDateParts(date: Date, locale: string) {
  const get = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...opts, timeZone: EVENT_TIME_ZONE })
      .format(date)
      .replace('.', '');
  return {
    weekday: get({ weekday: 'short' }),
    day: get({ day: 'numeric' }),
    month: get({ month: 'short' }),
  };
}

/** Groups items by "month year" in the event time zone, preserving order. */
export function groupByMonth<T>(items: T[], getDate: (item: T) => Date, locale: string) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = formatEventDate(getDate(item), locale, 'monthYear');
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.entries()].map(([month, entries]) => ({ month, entries }));
}
