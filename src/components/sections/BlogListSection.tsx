import Image from 'next/image';
import { NotebookPen } from 'lucide-react';
import { BlogPost } from '@/lib/cms/types';
import { Link } from '@/i18n/navigation';
import { formatEventDate } from '@/lib/dates';
import { EmptyState } from '@/components/feedback/EmptyState';
import { CategoryBadge } from '@/components/ui/category-badge';

type Props = {
  posts: BlogPost[];
  locale: string;
  translations: { empty: string; readMore: string };
};

export function BlogListSection({ posts, locale, translations }: Props) {
  if (posts.length === 0) {
    return (
      <section className="section pt-8">
        <div className="container-page">
          <EmptyState Icon={NotebookPen} title={translations.empty} />
        </div>
      </section>
    );
  }

  return (
    <section className="section pt-8 md:pt-12">
      <div className="container-page">
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-300 focus-within:ring-2 focus-within:ring-primary hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary to-plane">
                  {post.coverImage && (
                    <Image
                      src={post.coverImage}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    {post.category && <CategoryBadge>{post.category}</CategoryBadge>}
                    <time dateTime={post.publishedAt.toISOString()}>
                      {formatEventDate(post.publishedAt, locale, 'long')}
                    </time>
                  </div>
                  <h2 className="mt-3 text-xl font-bold leading-snug group-hover:text-primary">
                    <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 focus:outline-none">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 line-clamp-3 text-text-muted">{post.excerpt}</p>
                  <span aria-hidden className="mt-auto pt-4 font-nav text-sm font-semibold text-primary">
                    {translations.readMore} →
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
