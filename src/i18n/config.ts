export const locales = ['es', 'en'] as const;
export const defaultLocale = 'es' as const;

export type Locale = (typeof locales)[number];

/** Cookie that stores the visitor's language choice (no locale in URLs). */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (locales as readonly string[]).includes(value);

/**
 * Picks the best supported locale from an Accept-Language header,
 * e.g. "en-US,en;q=0.9,es;q=0.8" → "en".
 */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;
  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = Number(params.find((p) => p.trim().startsWith('q='))?.split('=')[1] ?? 1);
      return { lang: tag.toLowerCase().split('-')[0], q: Number.isFinite(q) ? q : 0 };
    })
    .sort((a, b) => b.q - a.q);
  const match = ranked.find((entry) => isLocale(entry.lang));
  return match ? (match.lang as Locale) : defaultLocale;
}
