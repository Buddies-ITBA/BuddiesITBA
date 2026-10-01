import { getLocale, getTranslations } from 'next-intl/server';
import { PageTitle } from '@/components/sections/PageTitle';
import { BlogListSection } from '@/components/sections/BlogListSection';
import { listPosts } from '@/lib/data/public';
import { pageMetadata } from '@/lib/metadata';

export const generateMetadata = () => pageMetadata('blog.page');

export default async function BlogPage() {
  const locale = await getLocale();
  const [t, posts] = await Promise.all([getTranslations('blog'), listPosts(locale)]);

  return (
    <>
      <PageTitle title={t('page.title')} description={t('page.description')} />
      <BlogListSection posts={posts} locale={locale} translations={{ empty: t('list.empty'), readMore: t('list.readMore') }} />
    </>
  );
}
