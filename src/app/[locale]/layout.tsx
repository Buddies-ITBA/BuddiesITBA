import type { Metadata, Viewport } from 'next';
import { Open_Sans, Raleway, Poppins } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { resolveLocale } from '@/i18n/server';
import { site } from '@/config/site';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import '../globals.css';

const openSans = Open_Sans({ variable: '--font-open-sans', subsets: ['latin'], display: 'swap' });
const raleway = Raleway({ variable: '--font-raleway', subsets: ['latin'], display: 'swap' });
const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

// Pages are statically rendered and refreshed from the CMS every 10 minutes.
// (Notion file URLs expire after ~1h, so keep this well below that.)
export const revalidate = 600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#0c5781',
};

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    metadataBase: new URL(site.url),
    title: { default: t('title'), template: `%s · ${site.name}` },
    description: t('description'),
    openGraph: {
      type: 'website',
      siteName: site.name,
      locale,
      images: [{ url: '/assets/img/tour_hero.png', width: 1850, height: 870 }],
    },
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
    },
    icons: {
      icon: [
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    manifest: '/site.webmanifest',
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const locale = await resolveLocale(params);
  const t = await getTranslations('nav');

  return (
    <html
      lang={locale}
      className={`${openSans.variable} ${raleway.variable} ${poppins.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
