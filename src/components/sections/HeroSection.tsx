import Image from 'next/image';

type HeroSectionProps = {
  title: string;
  subtitle: string;
  imageAlt: string;
};

export function HeroSection({ title, subtitle, imageAlt }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-primary text-white">
      <div className="absolute inset-0">
        <Image
          src="/assets/img/tour_hero.png"
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-primary/60" />
      </div>
      <div className="relative container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-heading font-bold leading-tight">
            {title}
          </h2>
          <p className="mt-4 text-lg text-white/90">{subtitle}</p>
        </div>
      </div>
    </section>
  );
}

