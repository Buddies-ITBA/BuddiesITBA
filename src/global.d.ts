import type { Locale } from '@/i18n/config';
import type messages from '@/messages/es.json';

// Type-safe translations: `t('home.hero.title')` is checked at compile time.
// Spanish is the source of truth; messages.test.ts keeps en.json in sync.
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}
