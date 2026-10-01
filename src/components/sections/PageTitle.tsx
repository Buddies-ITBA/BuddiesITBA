import { ChevronRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { FlightPath } from '@/components/brand/flight-path';

type Breadcrumb = { label: string; href?: string };

type PageTitleProps = {
  title: string;
  description?: string;
  /** Trail after "Home"; the last item is the current page. */
  breadcrumbs?: Breadcrumb[];
};

export async function PageTitle({ title, description, breadcrumbs }: PageTitleProps) {
  const t = await getTranslations('nav');
  const trail: Breadcrumb[] = [{ label: t('home'), href: '/' }, ...(breadcrumbs ?? [{ label: title }])];

  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-b from-sky to-background">
      <FlightPath className="absolute -right-16 top-4 -z-10 w-[26rem] opacity-60 md:right-4" />
      <div className="container-page pb-10 pt-8 md:pb-14 md:pt-10">
        <nav aria-label={t('breadcrumb')}>
          <ol className="flex flex-wrap items-center gap-1 text-sm text-text-muted">
            {trail.map((crumb, index) => {
              const isLast = index === trail.length - 1;
              return (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                  {crumb.href && !isLast ? (
                    <Link href={crumb.href} className="rounded hover:text-primary hover:underline">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="line-clamp-1 font-medium text-heading">
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && <ChevronRight className="size-3.5 opacity-60" aria-hidden />}
                </li>
              );
            })}
          </ol>
        </nav>
        <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight md:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-lg text-text-muted">{description}</p>}
      </div>
    </div>
  );
}
