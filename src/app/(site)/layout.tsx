import { SiteChrome } from '@/components/sections/SiteChrome';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
