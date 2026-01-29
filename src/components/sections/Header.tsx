'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { LanguageSwitcher } from './LanguageSwitcher';

const navItems = [
  { key: 'home', href: '' },
  { key: 'about', href: '/about' },
  { key: 'events', href: '/events' },
  { key: 'blog', href: '/blog' },
  { key: 'faq', href: '/faq' },
  { key: 'contact', href: '/contact' },
];

export function Header({ locale }: { locale: string }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    const fullPath = `/${locale}${href}`;
    if (href === '') {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname.startsWith(fullPath);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="text-2xl font-heading font-extrabold text-primary tracking-tight">
            Buddies ITBA
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.key}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={`/${locale}${item.href}`}
                      className={`${navigationMenuTriggerStyle()} ${isActive(item.href)
                        ? 'bg-primary/10 text-primary font-bold hover:bg-primary/20 hover:text-primary'
                        : 'bg-transparent hover:bg-sky-100 hover:text-primary'
                        }`}
                    >
                      <span className="cursor-pointer">{t(item.key)}</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <div className="ml-4">
            <LanguageSwitcher locale={locale} />
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="text-primary font-heading text-2xl font-bold mb-6 text-left">
                Buddies ITBA
              </SheetTitle>
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    href={`/${locale}${item.href}`}
                    onClick={() => setOpen(false)}
                    className={`block py-2 text-lg font-nav transition-colors hover:text-primary ${isActive(item.href)
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground'
                      }`}
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
