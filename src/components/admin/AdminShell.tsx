'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { CalendarDays, ExternalLink, HeartHandshake, Images, LayoutDashboard, LogOut, Mail, Menu, MessageCircleQuestion, MessageSquareQuote, Newspaper, Settings, ShieldCheck, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/admin', label: 'Inicio', Icon: LayoutDashboard, exact: true },
  { href: '/admin/events', label: 'Eventos', Icon: CalendarDays },
  { href: '/admin/buddies', label: 'Programa Buddies', Icon: HeartHandshake },
  { href: '/admin/faq', label: 'FAQ', Icon: MessageCircleQuestion },
  { href: '/admin/blog', label: 'Blog', Icon: Newspaper },
  { href: '/admin/team', label: 'Equipo', Icon: Users },
  { href: '/admin/testimonials', label: 'Testimonios', Icon: MessageSquareQuote },
  { href: '/admin/gallery', label: 'Galería', Icon: Images },
  { href: '/admin/settings', label: 'Sitio', Icon: Settings },
  { href: '/admin/emails', label: 'Emails', Icon: Mail },
  { href: '/admin/admins', label: 'Administradores', Icon: ShieldCheck },
];

export function AdminShell({ admin, logout, children }: { admin: { name: string; email: string }; logout: () => Promise<void>; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-4">
      <Link href="/admin" className="mb-6 flex items-center gap-2 px-2">
        <Image src="/assets/img/logo.png" alt="Buddies" width={640} height={223} sizes="100px" className="h-8 w-auto" />
        <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Admin</span>
      </Link>
      {nav.map(({ href, label, Icon, exact }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          aria-current={isActive(href, exact) ? 'page' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive(href, exact) ? 'bg-primary text-white' : 'text-text hover:bg-sky'
          )}
        >
          <Icon className="size-4" aria-hidden />
          {label}
        </Link>
      ))}
      <div className="mt-auto space-y-1 border-t pt-4">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-sky">
          <ExternalLink className="size-4" aria-hidden /> Ver sitio
        </Link>
        <form action={logout}>
          <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-sky">
            <LogOut className="size-4" aria-hidden /> Salir
          </button>
        </form>
        <p className="truncate px-3 pt-2 text-xs text-text-muted" title={admin.email}>
          {admin.name}
        </p>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r bg-white lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Cerrar menú" className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">{sidebar}</aside>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 border-b bg-white px-4 py-3 lg:hidden">
          <button type="button" aria-label="Abrir menú" onClick={() => setOpen(true)} className="grid size-9 place-items-center rounded-lg hover:bg-sky">
            <Menu className="size-5" />
          </button>
          <span className="font-semibold">Admin Buddies</span>
        </div>
        <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
