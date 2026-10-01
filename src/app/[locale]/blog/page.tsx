import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageTitle } from '@/components/sections/PageTitle';
import { BlogListSection } from '@/components/sections/BlogListSection';
import { cms } from '@/lib/cms';
import { pageMetadata } from '@/lib/metadata';
import type { Locale } from '@/i18n/config';

export const generateMetadata = ({ params }: PageProps<'/[locale]/blog'>) =>
  pageMetadata(params, 'blog.page');

export default async function BlogPage({ params }: PageProps<'/[locale]/blog'>) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);

  const [t, posts] = await Promise.all([getTranslations('blog'), cms.getPosts(locale)]);

  return (
    <>
      <PageTitle title={t('page.title')} description={t('page.description')} />
      <BlogListSection
        posts={posts}
        locale={locale}
        translations={{ empty: t('list.empty'), readMore: t('list.readMore') }}
      />
    </>
  );
}
