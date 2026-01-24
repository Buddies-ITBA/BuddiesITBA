import Link from 'next/link';

type Breadcrumb = {
  label: string;
  href?: string;
};

type PageTitleProps = {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
};

export function PageTitle({ title, description, breadcrumbs }: PageTitleProps) {
  return (
    <div className="bg-surface border-b">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav className="border-b bg-background/60">
          <div className="container mx-auto px-4 py-3">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
              {breadcrumbs.map((crumb, index) => (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-primary transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-heading">{crumb.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 ? <span>/</span> : null}
                </li>
              ))}
            </ol>
          </div>
        </nav>
      ) : null}
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-heading">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 text-text-muted max-w-3xl mx-auto">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

