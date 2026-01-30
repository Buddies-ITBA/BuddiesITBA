'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Event, NotionBlock } from '@/lib/cms/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotionBlockRenderer } from '@/components/ui/notion-block-renderer';
import { getEventDetails } from '@/app/actions';
import { Loader2, Calendar, Clock, MapPin, MessageCircle } from 'lucide-react';
import { AddToCalendar, AddToCalendarIcon } from '@/components/ui/add-to-calendar';

type Translations = {
  empty: string;
  capacity: string;
  whatsappNote: string;
  register: string;
};

type Props = {
  events: Event[];
  locale: string;
  translations: Translations;
};

export function EventsTimeline({ events, locale, translations }: Props) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventDetails, setEventDetails] = useState<NotionBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenEvent = async (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    setIsLoading(true);

    try {
      const blocks = await getEventDetails(event.id);
      setEventDetails(blocks);
    } catch (error) {
      console.error('Failed to load event details', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Group events by month/year
  const eventsByMonth = events.reduce(
    (acc, event) => {
      const monthKey = new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
      }).format(event.date);

      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(event);
      return acc;
    },
    {} as Record<string, Event[]>
  );

  if (events.length === 0) {
    return (
      <section className="bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mx-auto max-w-md rounded-2xl bg-surface p-8">
            <div className="text-4xl text-muted-foreground">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
            </div>
            <p className="mt-4 text-text-muted">
              {translations.empty}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="mx-auto max-w-2xl">
          {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
            <div key={month} className="mb-8">
              {/* Month header */}
              <h3 className="mb-6 text-xl font-heading font-bold capitalize text-primary border-b pb-2">
                {month}
              </h3>

              {/* Timeline */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border md:left-4" />

                {/* Events */}
                <div className="space-y-8">
                  {monthEvents.map((event) => (
                    <div key={event.id} className="relative pl-10 md:pl-12 group">
                      {/* Timeline dot */}
                      <div className="absolute left-1.5 top-1.5 h-4 w-4 rounded-full border-4 border-background bg-primary shadow-sm md:left-2 transition-transform group-hover:scale-125" />

                      {/* Event card */}
                      <div
                        className="overflow-hidden rounded-xl bg-card border shadow-sm hover:shadow-md transition-all cursor-pointer"
                        onClick={() => handleOpenEvent(event)}
                      >
                        {/* Flyer image */}
                        {event.image && (
                          <div className="relative h-48 w-full md:h-56">
                            <Image
                              src={event.image}
                              alt={event.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                              <h4 className="text-lg font-heading font-bold text-white md:text-xl line-clamp-2 flex-1 mr-2">
                                {event.title}
                              </h4>
                            </div>
                            <div className="absolute top-2 right-2">
                              <AddToCalendarIcon event={event} className="bg-white/90 hover:bg-white text-black hover:text-primary rounded-full shadow-sm h-8 w-8" />
                            </div>
                          </div>
                        )}

                        <div className="p-4 md:p-5">
                          {!event.image && (
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <h4 className="text-lg font-heading font-bold text-card-foreground md:text-xl">
                                {event.title}
                              </h4>
                              <AddToCalendarIcon event={event} className="-mt-1 -mr-1" />
                            </div>
                          )}

                          {/* Date & time badge */}
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize text-secondary-foreground">
                              {formatDate(event.date)}
                            </span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {formatTime(event.date)}
                            </span>
                          </div>

                          {/* Location */}
                          {event.location && (
                            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" /> {event.location}
                            </p>
                          )}

                          {/* Teaser Description */}
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>

                          {/* Capacity */}
                          {event.capacity && (
                            <p className="mt-3 text-xs text-muted-foreground/80">
                              {translations.capacity} {event.capacity}
                            </p>
                          )}

                          <Button variant="link" className="mt-2 h-auto p-0 text-primary">
                            Read more →
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          {selectedEvent && (
            <>
              <div className="relative h-40 sm:h-56 w-full shrink-0">
                {selectedEvent.image ? (
                  <Image
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
                  <DialogTitle className="text-2xl font-heading font-bold text-white mb-1 shadow-black drop-shadow-md">
                    {selectedEvent.title}
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm font-medium">
                    <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md">
                      {formatDate(selectedEvent.date)}
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md">
                      {formatTime(selectedEvent.date)}
                    </span>
                    {selectedEvent.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {selectedEvent.location}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-6 left-6 z-10">
                    <AddToCalendar event={selectedEvent} variant="secondary" size="sm" className="shadow-md" />
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <DialogDescription asChild className="text-base text-muted-foreground mb-6">
                  <div>
                    {/* Fallback description if no blocks */}
                    {(!eventDetails || eventDetails.length === 0) && !isLoading && (
                      <p>{selectedEvent.description}</p>
                    )}

                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <NotionBlockRenderer blocks={eventDetails} />
                    )}
                  </div>
                </DialogDescription>

                {/* Registration Action */}
                <div className="mt-8 pt-4 border-t">
                  {selectedEvent.registrationType === 'whatsapp' && (
                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-sm text-green-700 dark:text-green-300 border border-green-200 dark:border-green-900 flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      {translations.whatsappNote}
                    </div>
                  )}
                  {selectedEvent.registrationType === 'forms' && selectedEvent.registrationLink && (
                    <Button asChild className="w-full text-lg py-6 shadow-lg shadow-primary/20">
                      <a
                        href={selectedEvent.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {translations.register}
                      </a>
                    </Button>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section >
  );
}
