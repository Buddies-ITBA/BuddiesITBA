import { defaultLocale, type Locale } from '@/i18n/config';

/**
 * Text stored in the database in several languages, e.g. `{ es: 'Hola', en: 'Hi' }`.
 * Spanish is required; other languages fall back to it. Adding a language
 * only means adding a key — no schema change.
 */
export type Localized = { es: string } & Partial<Record<Locale, string>>;

export function pick(text: Localized | null | undefined, locale: Locale): string {
  if (!text) return '';
  return text[locale]?.trim() || text[defaultLocale] || '';
}

export const emptyLocalized = (): Localized => ({ es: '', en: '' });
