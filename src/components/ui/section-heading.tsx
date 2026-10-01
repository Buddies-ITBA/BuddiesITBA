import { cn } from '@/lib/utils';

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  /** Heading level; pages own the single <h1>, sections default to <h2>. */
  as?: 'h1' | 'h2';
  id?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  as: Heading = 'h2',
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className
      )}
    >
      {eyebrow && (
        <p className="mb-3 inline-flex items-center gap-2 font-nav text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sun" />
          {eyebrow}
        </p>
      )}
      <Heading id={id} className="text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </Heading>
      {subtitle && <p className="mt-4 text-lg text-text-muted">{subtitle}</p>}
    </div>
  );
}
