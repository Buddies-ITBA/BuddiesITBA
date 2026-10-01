import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { FlightPath } from '@/components/brand/flight-path';

type HeroSectionProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  imageAlt: string;
};

export function HeroSection({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  imageAlt,
}: HeroSectionProps) {
  return (
    <section className="relative isolate overflow-hidden bg-primary-dark text-white">
      <Image
        src="/assets/img/tour_hero.png"
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[center_70%]"
      />
      {/* Brand-tinted scrim: strong on the text side, lets the photo breathe on the right */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-primary-dark via-primary-dark/80 to-primary-dark/30 md:bg-gradient-to-r md:from-primary-dark/95 md:via-primary-dark/70 md:to-primary-dark/10" />

      <div className="container-page flex min-h-[560px] flex-col justify-end pb-16 pt-28 md:min-h-[min(78vh,720px)] md:justify-center md:py-24">
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-nav text-xs font-medium tracking-wide text-white/90 ring-1 ring-white/20 backdrop-blur-sm">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sun" />
            {eyebrow}
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85 md:text-xl">{subtitle}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="sun">
              <Link href="/events">
                {primaryCta}
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="glass">
              <a href="#how-it-works">{secondaryCta}</a>
            </Button>
          </div>
        </div>
      </div>

      <FlightPath className="absolute bottom-8 right-6 hidden w-72 text-white/40 md:block lg:w-96" />
    </section>
  );
}
