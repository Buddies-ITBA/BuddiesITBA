import { getTranslations } from 'next-intl/server';
import { Header } from './Header';
import { Footer } from './Footer';

/** Public-site frame: skip link, header, main landmark, footer. */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('nav');
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
      >
        {t('skipToContent')}
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
