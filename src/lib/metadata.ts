import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

type PageNamespace = 'about.page' | 'events.page' | 'blog.page' | 'faq.page' | 'contact.page' | 'buddies.page';

/** Standard `generateMetadata` for static pages: `{namespace}.title` / `.description`. */
export async function pageMetadata(namespace: PageNamespace): Promise<Metadata> {
  const t = await getTranslations(namespace);
  const title = t('title');
  const description = t('description');
  return { title, description, openGraph: { title, description } };
}
