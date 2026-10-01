'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { navItems, site } from '@/config/site';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-[background-color,box-shadow,border-color] duration-300',
        scrolled
          ? 'border-border bg-white/85 shadow-sm backdrop-blur-md'
          : 'border-transparent bg-white'
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-[72px]">
        <Link href="/" className="shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
          <Image
            src="/assets/img/logo.png"
            alt={site.name}
            width={640}
            height={223}
            sizes="128px"
            loading="eager"
            className="h-9 w-auto md:h-10"
          />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative rounded-full px-3.5 py-2 font-nav text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary',
                  active
                    ? 'bg-sky text-primary'
                    : 'text-text hover:bg-sky/60 hover:text-primary'
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
          <LanguageSwitcher className="ml-3" />
        </nav>

        {/* Mobile navigation */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t('menu')}>
                <Menu className="!size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm">
              <SheetTitle className="sr-only">{site.name}</SheetTitle>
              <Image
                src="/assets/img/logo.png"
                alt=""
                width={640}
                height={223}
                sizes="128px"
                className="mb-8 h-9 w-auto"
              />
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'rounded-xl px-4 py-3 font-nav text-lg font-medium transition-colors',
                        active ? 'bg-sky text-primary' : 'text-text hover:bg-sky/60'
                      )}
                    >
                      {t(item.key)}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
