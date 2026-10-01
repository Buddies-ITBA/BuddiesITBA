'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { locales } from '@/i18n/config';
import { setLocale } from '@/i18n/actions';
import { cn } from '@/lib/utils';

/** Language toggle: stores the choice in a cookie and re-renders in place (URLs stay the same). */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations('nav');
  const [pending, startTransition] = useTransition();

  return (
    <div role="group" aria-label={t('language')} className={cn('flex rounded-full bg-sky p-0.5', pending && 'opacity-70', className)}>
      {locales.map((loc) => {
        const active = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            lang={loc}
            aria-pressed={active}
            disabled={pending}
            onClick={() => !active && startTransition(() => setLocale(loc))}
            className={cn(
              'rounded-full px-2.5 py-1 font-nav text-xs font-semibold uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              active ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-primary'
            )}
          >
            {loc}
          </button>
        );
      })}
    </div>
  );
}
