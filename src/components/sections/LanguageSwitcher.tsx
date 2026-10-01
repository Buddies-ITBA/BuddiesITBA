'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('nav');

  return (
    <nav aria-label={t('language')} className={cn('flex rounded-full bg-sky p-0.5', className)}>
      {routing.locales.map((loc) => {
        const active = loc === locale;
        return (
          <Link
            key={loc}
            href={pathname}
            locale={loc}
            hrefLang={loc}
            lang={loc}
            aria-current={active ? 'true' : undefined}
            className={cn(
              'rounded-full px-2.5 py-1 font-nav text-xs font-semibold uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              active ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-primary'
            )}
          >
            {loc}
          </Link>
        );
      })}
    </nav>
  );
}
