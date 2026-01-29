import { getTranslations } from 'next-intl/server';
import { PageTitle } from '@/components/sections/PageTitle';
import { BlogListSection } from '@/components/sections/BlogListSection';
import { cms } from '@/lib/cms';
import { Locale } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const tPage = await getTranslations('blog.page');
  const tList = await getTranslations('blog.list');
  const tNav = await getTranslations('nav');

  const posts = await cms.getPosts(locale as Locale);

  return (
    <>
      <PageTitle
        title={tPage('title')}
        description={tPage('description')}
        breadcrumbs={[
          { label: tNav('home'), href: `/${locale}` },
          { label: tPage('breadcrumb') },
        ]}
      />
      <BlogListSection
        posts={posts}
        locale={locale}
        translations={{
          empty: tList('empty'),
          readMore: tList('readMore'),
        }}
      />
    </>
  );
}
