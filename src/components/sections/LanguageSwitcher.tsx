'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { locales } from '@/i18n/config';

export function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    // Remove current locale from pathname and add new one
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <div className="flex items-center gap-1">
      {locales.map((loc) => (
        <Button
          key={loc}
          variant={locale === loc ? 'default' : 'ghost'}
          size="sm"
          onClick={() => switchLocale(loc)}
          className={`px-2 py-1 text-xs font-medium ${
            locale === loc
              ? 'bg-primary text-white'
              : 'text-text-muted hover:text-primary'
          }`}
        >
          {loc.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}
