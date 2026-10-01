'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { CalendarX2, Instagram, Loader2, MessageCircle } from 'lucide-react';
import { Event, NotionBlock } from '@/lib/cms/types';
import { getEventDetails } from '@/app/actions';
import { site } from '@/config/site';
import { groupByMonth } from '@/lib/dates';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotionBlockRenderer } from '@/components/ui/notion-block-renderer';
import { AddToCalendar, type AddToCalendarLabels } from '@/components/ui/add-to-calendar';
import { DateBadge, EventMeta, ExchangeOnlyBadge } from '@/components/events/badges';
import { EmptyState } from '@/components/feedback/EmptyState';

type Translations = {
  empty: string;
  emptyHint: string;
  capacity: string;
  whatsappNote: string;
  register: string;
  exchangeOnly: string;
  details: string;
  loadError: string;
  instagram: string;
  calendar: AddToCalendarLabels;
};

type Props = {
  events: Event[];
  locale: string;
  translations: Translations;
};

type DetailsState = { status: 'loading' | 'ready' | 'error'; blocks: NotionBlock[] };

export function EventsTimeline({ events, locale, translations: t }: Props) {
  const [selected, setSelected] = useState<Event | null>(null);
  const [details, setDetails] = useState<DetailsState>({ status: 'loading', blocks: [] });
  const cache = useRef(new Map<string, NotionBlock[]>());
  const latestRequest = useRef<string | null>(null);
  const months = useMemo(() => groupByMonth(events, (event) => event.date, locale), [events, locale]);

  const openEvent = async (event: Event) => {
    setSelected(event);
    latestRequest.current = event.id;

    const cached = cache.current.get(event.id);
    if (cached) {
      setDetails({ status: 'ready', blocks: cached });
      return;
    }

    setDetails({ status: 'loading', blocks: [] });
    try {
      const blocks = await getEventDetails(event.id);
      cache.current.set(event.id, blocks);
      // Ignore responses for an event the user already navigated away from
      if (latestRequest.current === event.id) setDetails({ status: 'ready', blocks });
    } catch {
      if (latestRequest.current === event.id) setDetails({ status: 'error', blocks: [] });
    }
  };

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
        {months.map(({ month, entries }) => (
          <section key={month} aria-label={month} className="mb-12 last:mb-0">
            <h2 className="sticky top-16 z-10 -mx-4 mb-6 bg-background/90 px-4 py-2 text-lg font-bold text-primary backdrop-blur md:top-[72px]">
              {month}
            </h2>

            <ol className="space-y-5">
              {entries.map((event) => (
                <li key={event.id} id={event.id} className="flex gap-3 sm:gap-5">
                  <DateBadge date={event.date} locale={locale} className="mt-1 hidden sm:flex" />

                  <article className="group relative flex flex-1 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-primary hover:shadow-lg sm:flex-row">
                    <div className="relative aspect-[16/9] shrink-0 overflow-hidden bg-gradient-to-br from-primary to-plane sm:aspect-auto sm:w-56">
                      {event.image && (
                        <Image
                          src={event.image}
                          alt=""
                          fill
                          sizes="(min-width: 640px) 224px, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <DateBadge date={event.date} locale={locale} className="absolute left-3 top-3 sm:hidden" />
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      {event.exchangeOnly && <ExchangeOnlyBadge label={t.exchangeOnly} className="mb-2 self-start" />}
                      <h3 className="text-lg font-bold leading-snug md:text-xl">
                        {/* Stretched button: the whole card is clickable, but it's one real control */}
                        <button
                          type="button"
                          onClick={() => openEvent(event)}
                          className="text-left after:absolute after:inset-0 after:content-[''] focus:outline-none"
                        >
                          {event.title}
                        </button>
                      </h3>
                      <EventMeta event={event} locale={locale} className="mt-2" />
                      <p className="mt-3 line-clamp-2 text-sm text-text-muted">{event.description}</p>

                      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                        <span className="font-nav text-sm font-semibold text-primary group-hover:underline">
                          {t.details} →
                        </span>
                        {/* Sits above the stretched button so it stays independently clickable */}
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

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
          {selected && (
            <>
              <div className="relative h-44 w-full shrink-0 bg-gradient-to-br from-primary to-plane sm:h-60">
                {selected.image && (
                  <Image src={selected.image} alt="" fill sizes="672px" className="object-cover" />
                )}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6">
                  <DialogTitle className="text-2xl font-bold text-white drop-shadow">{selected.title}</DialogTitle>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6">
                  <EventMeta event={selected} locale={locale} capacityLabel={t.capacity} />
                  {selected.exchangeOnly && <ExchangeOnlyBadge label={t.exchangeOnly} className="mt-4" />}

                  <DialogDescription asChild>
                    <div className="mt-6">
                      {details.status === 'loading' && (
                        <div className="flex justify-center py-10">
                          <Loader2 className="size-7 animate-spin text-primary" aria-hidden />
                        </div>
                      )}
                      {details.status === 'error' && <p className="mb-3 text-sm italic">{t.loadError}</p>}
                      {details.status !== 'loading' &&
                        (details.blocks.length > 0 ? (
                          <NotionBlockRenderer blocks={details.blocks} />
                        ) : (
                          <p className="text-base leading-relaxed text-text-muted">{selected.description}</p>
                        ))}
                    </div>
                  </DialogDescription>
                </div>
              </ScrollArea>

              <div className="flex shrink-0 flex-col gap-3 border-t bg-background p-4 sm:flex-row sm:items-center">
                {selected.registrationType === 'whatsapp' && (
                  <p className="flex flex-1 items-center gap-2 text-sm font-medium text-[#166534]">
                    <MessageCircle className="size-5 shrink-0" aria-hidden />
                    {t.whatsappNote}
                  </p>
                )}
                {selected.registrationType === 'forms' && selected.registrationLink && (
                  <Button asChild size="lg" className="flex-1">
                    <a href={selected.registrationLink} target="_blank" rel="noopener noreferrer">
                      {t.register}
                    </a>
                  </Button>
                )}
                <AddToCalendar event={selected} labels={t.calendar} className={selected.registrationType ? '' : 'flex-1'} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
