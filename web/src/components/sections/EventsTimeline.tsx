import Image from 'next/image';
import { Event } from '@/lib/cms/types';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

type Props = {
  events: Event[];
  locale: string;
  emptyMessage?: string;
};

export function EventsTimeline({ events, locale, emptyMessage }: Props) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'es' ? 'es-AR' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'es' ? 'es-AR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Group events by month/year
  const eventsByMonth = events.reduce(
    (acc, event) => {
      const monthKey = new Intl.DateTimeFormat(locale === 'es' ? 'es-AR' : 'en-US', {
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
            <div className="text-4xl">📅</div>
            <p className="mt-4 text-text-muted">
              {emptyMessage || (locale === 'es' ? 'No hay eventos próximos' : 'No upcoming events')}
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
              <h3 className="mb-6 text-lg font-heading font-semibold capitalize text-primary">
                {month}
              </h3>

              {/* Timeline */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-primary/20 md:left-4" />

                {/* Events */}
                <div className="space-y-6">
                  {monthEvents.map((event, index) => (
                    <div key={event.id} className="relative pl-10 md:pl-12">
                      {/* Timeline dot */}
                      <div className="absolute left-1.5 top-1 h-4 w-4 rounded-full border-2 border-primary bg-surface md:left-2" />

                      {/* Event card */}
                      <div className="overflow-hidden rounded-xl bg-surface shadow-sm">
                        {/* Flyer image */}
                        {event.image && (
                          <Image
                            src={event.image}
                            alt={event.title}
                            width={600}
                            height={400}
                            sizes="(min-width: 768px) 600px, 100vw"
                            className="h-48 w-full object-cover md:h-56"
                          />
                        )}

                        <div className="p-4 md:p-5">
                          {/* Date & time badge */}
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium capitalize text-primary">
                              {formatDate(event.date)}
                            </span>
                            <span className="text-sm text-text-muted">
                              {formatTime(event.date)}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="text-lg font-heading font-semibold text-heading md:text-xl">
                            {event.title}
                          </h4>

                          {/* Location */}
                          {event.location && (
                            <p className="mt-1 flex items-center gap-1 text-sm text-text-muted">
                              <span>📍</span> {event.location}
                            </p>
                          )}

                          {/* Description */}
                          <div className="mt-3 prose prose-sm max-w-none text-text-muted prose-strong:text-text prose-a:text-primary prose-a:no-underline prose-a:hover:underline prose-ul:my-2 prose-li:my-0">
                            <ReactMarkdown>{event.description}</ReactMarkdown>
                          </div>

                          {/* Capacity */}
                          {event.capacity && (
                            <p className="mt-3 text-xs text-text-muted">
                              {locale === 'es' ? 'Cupos:' : 'Capacity:'} {event.capacity}
                            </p>
                          )}

                          {/* Registration */}
                          {event.registrationType === 'whatsapp' && (
                            <div className="mt-4 rounded-lg bg-primary/10 p-3 text-sm text-primary">
                              💬 {locale === 'es'
                                ? 'Inscripción por el grupo de WhatsApp de Buddies'
                                : 'Registration via Buddies WhatsApp group'}
                            </div>
                          )}
                          {event.registrationType === 'forms' && event.registrationLink && (
                            <div className="mt-4">
                              <Button asChild className="w-full bg-primary hover:bg-primary-dark">
                                <a
                                  href={event.registrationLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {locale === 'es' ? 'Inscribirse' : 'Register'}
                                </a>
                              </Button>
                            </div>
                          )}
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
    </section>
  );
}
