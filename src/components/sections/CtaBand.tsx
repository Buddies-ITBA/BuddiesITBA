import { Mail, MessageCircle } from 'lucide-react';
import { InstagramIcon as Instagram } from '@/components/brand/social-icons';
import Link from 'next/link';
import { site } from '@/config/site';
import { Button } from '@/components/ui/button';
import { FlightPath } from '@/components/brand/flight-path';

type CtaBandProps = {
  title: string;
  description: string;
  instagramLabel: string;
  contactLabel: string;
  whatsapp?: { url: string; label: string };
};

export function CtaBand({ title, description, instagramLabel, contactLabel, whatsapp }: CtaBandProps) {
  return (
    <section className="section">
      <div className="container-page">
        <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark px-6 py-14 text-center text-white shadow-xl md:px-16 md:py-20">
          <FlightPath className="absolute -left-10 -top-4 -z-10 w-80 text-white/20 md:w-[30rem]" />
          <h2 className="text-3xl font-bold text-white md:text-4xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">{description}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="sun">
              <a href={site.instagram.url} target="_blank" rel="noopener noreferrer">
                <Instagram />
                {instagramLabel}
              </a>
            </Button>
            {whatsapp && (
              <Button asChild size="lg" variant="glass">
                <a href={whatsapp.url} target="_blank" rel="noopener noreferrer">
                  <MessageCircle />
                  {whatsapp.label}
                </a>
              </Button>
            )}
            <Button asChild size="lg" variant="glass">
              <Link href="/contact">
                <Mail />
                {contactLabel}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
