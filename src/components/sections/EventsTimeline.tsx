import Image from 'next/image';
import Link from 'next/link';
import { CalendarX2 } from 'lucide-react';
import { InstagramIcon as Instagram } from '@/components/brand/social-icons';
import type { EventWithAvailability } from '@/lib/data/availability';
import { site } from '@/config/site';
import { groupByMonth } from '@/lib/dates';
import { Button } from '@/components/ui/button';
import { AddToCalendar, type AddToCalendarLabels } from '@/components/ui/add-to-calendar';
import { AvailabilityBadge, DateBadge, EventMeta, ExchangeOnlyBadge } from '@/components/events/badges';
import { EmptyState } from '@/components/feedback/EmptyState';

type Translations = {
  empty: string;
  emptyHint: string;
  exchangeOnly: string;
  details: string;
  instagram: string;
  calendar: AddToCalendarLabels;
};

type Props = {
  events: EventWithAvailability[];
  locale: string;
  translations: Translations;
};

export function EventsTimeline({ events, locale, translations: t }: Props) {
  if (events.length === 0) {
    return (
      <section className="section">
        <div className="container-page">
          <EmptyState Icon={CalendarX2} title={t.empty} hint={t.emptyHint}>
            <Button asChild>
              <a href={site.instagram.url} target="_blank" rel="noopener noreferrer">
                <Instagram />
                {t.instagram}
              </a>
            </Button>
          </EmptyState>
        </div>
      </section>
    );
  }

  return (
    <section className="section pt-10 md:pt-14">
      <div className="container-page max-w-4xl">
        {groupByMonth(events, (event) => event.startsAt, locale).map(({ month, entries }) => (
          <section key={month} aria-label={month} className="mb-12 last:mb-0">
            <h2 className="sticky top-16 z-10 -mx-4 mb-6 bg-background/90 px-4 py-2 text-lg font-bold text-primary backdrop-blur md:top-[72px]">
              {month}
            </h2>

            <ol className="space-y-5">
              {entries.map((event) => (
                <li key={event.id} className="flex gap-3 sm:gap-5">
                  <DateBadge date={event.startsAt} locale={locale} className="mt-1 hidden sm:flex" />

                  <article className="group relative flex flex-1 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-primary hover:shadow-lg sm:flex-row">
                    <div className="relative aspect-[16/9] shrink-0 overflow-hidden bg-gradient-to-br from-primary to-plane sm:aspect-auto sm:w-56">
                      {event.imageUrl && (
                        <Image
                          src={event.imageUrl}
                          alt=""
                          fill
                          sizes="(min-width: 640px) 224px, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <DateBadge date={event.startsAt} locale={locale} className="absolute left-3 top-3 sm:hidden" />
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      {(event.exchangeOnly || event.availability) && (
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          {event.availability && <AvailabilityBadge state={event.availability.state} label={event.availability.label} />}
                          {event.exchangeOnly && <ExchangeOnlyBadge label={t.exchangeOnly} />}
                        </div>
                      )}
                      <h3 className="text-lg font-bold leading-snug md:text-xl">
                        {/* Stretched link: the whole card is clickable */}
                        <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0 focus:outline-none">
                          {event.title}
                        </Link>
                      </h3>
                      <EventMeta event={event} locale={locale} className="mt-2" />
                      <p className="mt-3 line-clamp-2 text-sm text-text-muted">{event.summary}</p>

                      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                        <span className="font-nav text-sm font-semibold text-primary group-hover:underline">{t.details} →</span>
                        {/* Sits above the stretched link so it stays independently clickable */}
                        <AddToCalendar event={event} labels={t.calendar} iconOnly variant="ghost" className="relative z-10 -my-2 -mr-2" />
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </section>
  );
}
