import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { resolveLocale } from '@/i18n/server';

type PageNamespace = 'about.page' | 'events.page' | 'blog.page' | 'faq.page' | 'contact.page';

/** Standard `generateMetadata` for static pages: `{namespace}.title` / `.description`. */
export async function pageMetadata(
  params: Promise<{ locale: string }>,
  namespace: PageNamespace
): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace });
  const title = t('title');
  const description = t('description');
  return { title, description, openGraph: { title, description } };
}
