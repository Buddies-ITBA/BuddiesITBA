import { CheckCircle } from 'lucide-react';
import Image from 'next/image';

type AboutIntroSectionProps = {
  intro: string;
  points: string[];
  closing: string;
  imageAlt: string;
};

export function AboutIntroSection({
  intro,
  points,
  closing,
  imageAlt,
}: AboutIntroSectionProps) {
  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <p className="italic text-text-muted">{intro}</p>
            <ul className="mt-6 space-y-3">
              {points.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-accent" />
                  <span className="text-text">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-text-muted">{closing}</p>
          </div>
          <div className="order-1 lg:order-2">
            <Image
              src="/assets/img/teamFoto.png"
              alt={imageAlt}
              width={1200}
              height={900}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="w-full rounded-2xl object-cover shadow-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

