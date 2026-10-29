import Image from 'next/image';
import { Quote } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { cn } from '@/lib/utils';

type Testimonial = { id: string; name: string; flag: string; subtitle: string; quote: string; imageUrl: string | null };

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  testimonials: Testimonial[];
};

const tilts = ['md:-rotate-1', 'md:rotate-1', 'md:-rotate-[0.5deg]'];

/** Polaroid-style quotes. Horizontal swipe on phones, grid on desktop. */
export function TestimonialsSection({ eyebrow, title, subtitle, testimonials }: Props) {
  if (testimonials.length === 0) return null;
  return (
    <section className="section overflow-hidden">
      <div className="container-page">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </div>
      <ul className="container-page mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible">
        {testimonials.map((t, i) => (
          <li key={t.id} className={cn('w-[85%] shrink-0 snap-center md:w-auto', tilts[i % tilts.length])}>
            <figure className="flex h-full flex-col rounded-sm bg-white p-4 pb-6 shadow-[0_10px_30px_-12px_rgba(12,87,129,0.35)] ring-1 ring-border/60">
              {t.imageUrl && (
                <div className="relative aspect-[4/3] overflow-hidden bg-sky">
                  <Image src={t.imageUrl} alt="" fill sizes="(min-width: 768px) 33vw, 85vw" className="object-cover" />
                </div>
              )}
              <blockquote className="relative mt-5 flex-1 px-2 text-text">
                <Quote className="absolute -left-1 -top-2 size-6 text-sun" aria-hidden />
                <p className="pl-6 font-heading text-lg italic leading-relaxed">{t.quote}</p>
              </blockquote>
              <figcaption className="mt-5 px-2">
                <p className="font-bold text-heading">
                  {t.name} {t.flag && <span aria-hidden>{t.flag}</span>}
                </p>
                {t.subtitle && <p className="text-sm text-text-muted">{t.subtitle}</p>}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
