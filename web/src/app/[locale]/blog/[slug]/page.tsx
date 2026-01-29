import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PageTitle } from '@/components/sections/PageTitle';
import { NotionBlockRenderer } from '@/components/ui/notion-block-renderer';
import { cms } from '@/lib/cms';
import { Locale } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const tPost = await getTranslations('blog.post');
  const tPage = await getTranslations('blog.page');
  const tNav = await getTranslations('nav');

  const post = await cms.getPostBySlug(slug, locale as Locale);
  if (!post) notFound();

  const blocks = await cms.getPageBlocks(post.id);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  return (
    <>
      <PageTitle
        title={post.title}
        breadcrumbs={[
          { label: tNav('home'), href: `/${locale}` },
          { label: tPage('breadcrumb'), href: `/${locale}/blog` },
          { label: post.title },
        ]}
      />

      <article className="bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="mx-auto max-w-3xl">
            {/* Cover image */}
            {post.coverImage && (
              <div className="relative mb-8 h-64 overflow-hidden rounded-2xl md:h-96">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  priority
                  sizes="(min-width: 768px) 800px, 100vw"
                  className="object-cover"
                />
              </div>
            )}

            {/* Meta */}
            <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-text-muted">
              {post.category && (
                <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                  {post.category}
                </span>
              )}
              <span>{formatDate(post.publishedAt)}</span>
              {post.author.name && (
                <span>
                  {tPost('by')} <strong className="text-text">{post.author.name}</strong>
                </span>
              )}
            </div>

            {/* Content */}
            <div className="prose-lg">
              <NotionBlockRenderer blocks={blocks} />
            </div>

            {/* Back link */}
            <div className="mt-12 border-t pt-8">
              <Link
                href={`/${locale}/blog`}
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                ← {tPost('backToList')}
              </Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
