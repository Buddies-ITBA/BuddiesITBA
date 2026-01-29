import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/lib/cms/types';

type Translations = {
  empty: string;
  readMore: string;
};

type Props = {
  posts: BlogPost[];
  locale: string;
  translations: Translations;
};

export function BlogListSection({ posts, locale, translations }: Props) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  if (posts.length === 0) {
    return (
      <section className="bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mx-auto max-w-md rounded-2xl bg-surface p-8">
            <div className="text-4xl">📝</div>
            <p className="mt-4 text-text-muted">{translations.empty}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group overflow-hidden rounded-2xl bg-surface shadow-sm transition-shadow hover:shadow-md"
            >
              <Link href={`/${locale}/blog/${post.slug}`}>
                {post.coverImage && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5">
                  {post.category && (
                    <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {post.category}
                    </span>
                  )}
                  <h3 className="mt-2 text-lg font-heading font-semibold text-heading group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-text-muted">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
                    <span>{formatDate(post.publishedAt)}</span>
                    <span className="font-medium text-primary">
                      {translations.readMore} →
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
