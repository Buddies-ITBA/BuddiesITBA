import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageTitle } from '@/components/sections/PageTitle';
import { NotionBlockRenderer } from '@/components/ui/notion-block-renderer';
import { cms } from '@/lib/cms';
import { formatEventDate } from '@/lib/dates';
import type { Locale } from '@/i18n/config';

type Props = PageProps<'/[locale]/blog/[slug]'>;

// Shared between generateMetadata and the page so Notion is queried once per request
const getPost = cache((slug: string, locale: Locale) => cms.getPostBySlug(slug, locale));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = await getPost(slug, locale as Locale);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      ...(post.coverImage && { images: [post.coverImage] }),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);

  const post = await getPost(slug, locale);
  if (!post) notFound();

  const [t, tPage, blocks] = await Promise.all([
    getTranslations('blog.post'),
    getTranslations('blog.page'),
    cms.getPageBlocks(post.id),
  ]);

  return (
    <>
      <PageTitle
        title={post.title}
        breadcrumbs={[{ label: tPage('title'), href: '/blog' }, { label: post.title }]}
      />

      <article className="section pt-6 md:pt-10">
        <div className="container-page max-w-3xl">
          <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-text-muted">
            {post.category && (
              <span className="rounded-full bg-sky px-3 py-1 font-semibold text-primary">{post.category}</span>
            )}
            <time dateTime={post.publishedAt.toISOString()}>{formatEventDate(post.publishedAt, locale, 'long')}</time>
            {post.author.name && (
              <span>
                {t('by')} <strong className="text-text">{post.author.name}</strong>
              </span>
            )}
          </div>

          {post.coverImage && (
            <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl shadow-lg">
              <Image
                src={post.coverImage}
                alt=""
                fill
                priority
                sizes="(min-width: 768px) 768px, 100vw"
                className="object-cover"
              />
            </div>
          )}

          <NotionBlockRenderer blocks={blocks} />

          <div className="mt-14 border-t pt-8">
            <Link href="/blog" className="group inline-flex items-center gap-2 font-nav font-semibold text-primary">
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden />
              {t('backToList')}
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
