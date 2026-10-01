import Image from 'next/image';
import { Check } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';

type AboutIntroSectionProps = {
  eyebrow: string;
  title: string;
  intro: string;
  points: string[];
  closing: string;
  imageAlt: string;
};

export function AboutIntroSection({ eyebrow, title, intro, points, closing, imageAlt }: AboutIntroSectionProps) {
  return (
    <section className="section pt-8 md:pt-12">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative lg:order-2">
          <div aria-hidden className="absolute -inset-3 -z-10 -rotate-2 rounded-3xl bg-sky" />
          <Image
            src="/assets/img/teamFoto.png"
            alt={imageAlt}
            width={1342}
            height={988}
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="w-full rounded-3xl object-cover shadow-xl"
          />
        </div>
        <div className="lg:order-1">
          <SectionHeading eyebrow={eyebrow} title={title} subtitle={intro} align="left" />
          <ul className="mt-8 space-y-4">
            {points.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-sky text-primary">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 border-l-4 border-sun pl-4 text-text-muted">{closing}</p>
        </div>
      </div>
    </section>
  );
}
