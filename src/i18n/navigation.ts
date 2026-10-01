import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware wrappers: `<Link href="/events">` resolves to `/es/events` or `/en/events`.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
