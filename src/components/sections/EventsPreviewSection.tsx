import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import type { EventWithAvailability } from '@/lib/data/availability';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { AvailabilityBadge, DateBadge, EventMeta, ExchangeOnlyBadge } from '@/components/events/badges';

type EventsPreviewSectionProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  viewAll: string;
  events: EventWithAvailability[];
  locale: string;
  exchangeOnlyLabel: string;
};

export function EventsPreviewSection({
  eyebrow,
  title,
  subtitle,
  viewAll,
  events,
  locale,
  exchangeOnlyLabel,
}: EventsPreviewSectionProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="section bg-sky/60">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} align="left" />
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/events">
              {viewAll}
              <ArrowRight />
            </Link>
          </Button>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <li key={event.id}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-border/60 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-primary to-plane">
                  {event.imageUrl && (
                    <Image
                      src={event.imageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <DateBadge date={event.startsAt} locale={locale} className="absolute left-3 top-3" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  {(event.exchangeOnly || event.availability) && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {event.availability && <AvailabilityBadge state={event.availability.state} label={event.availability.label} />}
                      {event.exchangeOnly && <ExchangeOnlyBadge label={exchangeOnlyLabel} />}
                    </div>
                  )}
                  <h3 className="text-xl font-bold">
                    <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0 focus:outline-none">
                      {event.title}
                    </Link>
                  </h3>
                  <EventMeta event={event} locale={locale} className="mt-2" />
                  <p className="mt-3 line-clamp-2 text-text-muted">{event.summary}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
