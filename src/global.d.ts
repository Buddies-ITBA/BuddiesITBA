import type { locales } from '@/i18n/config';
import type messages from '@/messages/es.json';

// Type-safe translations: `t('home.hero.title')` is checked at compile time.
// Spanish is the source of truth; messages.test.ts keeps en.json in sync.
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof locales)[number];
    Messages: typeof messages;
  }
}
