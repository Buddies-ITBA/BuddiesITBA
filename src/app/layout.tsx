import type { Metadata, Viewport } from 'next';
import { Open_Sans, Raleway, Poppins } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import { site } from '@/config/site';
import './globals.css';

const openSans = Open_Sans({ variable: '--font-open-sans', subsets: ['latin'], display: 'swap' });
const raleway = Raleway({ variable: '--font-raleway', subsets: ['latin'], display: 'swap' });
const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0c5781',
};

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([getLocale(), getTranslations('meta')]);
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${openSans.variable} ${raleway.variable} ${poppins.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
