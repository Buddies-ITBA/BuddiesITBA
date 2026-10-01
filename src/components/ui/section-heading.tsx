import { cn } from '@/lib/utils';

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  id?: string;
};

/** Small uppercase label above headings, with the brand "sun" dot. */
export function Eyebrow({ children, dot = true, className }: { children: React.ReactNode; dot?: boolean; className?: string }) {
  return (
    <p className={cn('inline-flex items-center gap-2 font-nav text-xs font-semibold uppercase tracking-[0.18em] text-primary', className)}>
      {dot && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sun" />}
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  id,
}: SectionHeadingProps) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <h2 id={id} className="text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-lg text-text-muted">{subtitle}</p>}
    </div>
  );
}
