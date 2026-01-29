import { CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type HomeAboutSectionProps = {
  locale: string;
  title: string;
  subtitle: string;
  highlights: string[];
  ctaLabel: string;
  imageAlt: string;
};

export function HomeAboutSection({
  locale,
  title,
  subtitle,
  highlights,
  ctaLabel,
  imageAlt,
}: HomeAboutSectionProps) {
  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <h3 className="text-3xl md:text-4xl font-heading font-bold text-heading">
              {title}
            </h3>
            <p className="mt-4 italic text-text-muted">{subtitle}</p>
            <ul className="mt-6 space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-accent" />
                  <span className="text-text">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/${locale}/faq`}
              className="mt-6 inline-flex items-center gap-2 text-primary font-medium hover:text-primary-dark"
            >
              {ctaLabel}
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="order-1 lg:order-2">
            <Image
              src="/assets/img/mate_about.JPG"
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

