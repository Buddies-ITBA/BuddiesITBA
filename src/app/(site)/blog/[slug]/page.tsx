import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { PageTitle } from '@/components/sections/PageTitle';
import { Markdown } from '@/components/ui/markdown';
import { CategoryBadge } from '@/components/ui/category-badge';
import { getPostBySlug } from '@/lib/data/public';
import { formatEventDate } from '@/lib/dates';

type Props = PageProps<'/blog/[slug]'>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug, await getLocale());
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      ...(post.coverUrl && { images: [post.coverUrl] }),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const locale = await getLocale();
  const [post, t, tPage] = await Promise.all([
    params.then(({ slug }) => getPostBySlug(slug, locale)),
    getTranslations('blog.post'),
    getTranslations('blog.page'),
  ]);
  if (!post) notFound();

  return (
    <>
      <PageTitle title={post.title} breadcrumbs={[{ label: tPage('title'), href: '/blog' }, { label: post.title }]} />

      <article className="section pt-6 md:pt-10">
        <div className="container-page max-w-3xl">
          <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-text-muted">
            {post.category && <CategoryBadge>{post.category}</CategoryBadge>}
            <time dateTime={post.publishedAt.toISOString()}>{formatEventDate(post.publishedAt, locale, 'long')}</time>
            <span>
              {t('by')} <strong className="text-text">{post.authorName}</strong>
            </span>
          </div>

          {post.coverUrl && (
            <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl shadow-lg">
              <Image src={post.coverUrl} alt="" fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
            </div>
          )}

          <Markdown className="prose-lg">{post.body || post.excerpt}</Markdown>

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
