import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SectionHeading } from '@/components/ui/section-heading';
import { CheckList } from '@/components/ui/check-list';

type HomeAboutSectionProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  highlights: string[];
  ctaLabel: string;
  imageAlt: string;
};

export function HomeAboutSection({
  eyebrow,
  title,
  subtitle,
  highlights,
  ctaLabel,
  imageAlt,
}: HomeAboutSectionProps) {
  return (
    <section className="section">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} align="left" />
          <CheckList items={highlights} />
          <Link
            href="/about"
            className="group mt-8 inline-flex items-center gap-2 font-nav font-semibold text-primary hover:text-primary-dark"
          >
            {ctaLabel}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>

        <div className="relative">
          <div aria-hidden className="absolute -inset-3 -z-10 rotate-2 rounded-3xl bg-sky" />
          <Image
            src="/assets/img/mate_about.JPG"
            alt={imageAlt}
            width={1200}
            height={900}
            sizes="(min-width: 1152px) 544px, (min-width: 1024px) 50vw, 100vw"
            className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}
