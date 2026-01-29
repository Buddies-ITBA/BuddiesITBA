import Image from 'next/image';
import { Event } from '@/lib/cms/types';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

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

export function EventsListSection({ events, locale, translations }: Props) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (events.length === 0) {
    return (
      <section className="bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-text-muted">
            {translations.empty}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          {events.map((event) => (
            <article
              key={event.id}
              className="overflow-hidden rounded-2xl bg-surface shadow-sm"
            >
              {event.image && (
                <Image
                  src={event.image}
                  alt={event.title}
                  width={900}
                  height={600}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="h-64 w-full object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-heading font-semibold text-heading">
                  {event.title}
                </h3>
                <p className="mt-2 text-sm font-medium text-primary">
                  {formatDate(event.date)}
                </p>
                {event.location && (
                  <p className="mt-1 text-sm text-text-muted">
                    📍 {event.location}
                  </p>
                )}
                <div className="mt-4 prose prose-sm max-w-none text-text-muted prose-strong:text-text prose-a:text-primary prose-a:no-underline prose-a:hover:underline prose-ul:my-2 prose-li:my-0">
                  <ReactMarkdown>{event.description}</ReactMarkdown>
                </div>
                {event.capacity && (
                  <p className="mt-3 text-xs text-text-muted">
                    {translations.capacity} {event.capacity}
                  </p>
                )}
                {event.registrationType === 'whatsapp' && (
                  <div className="mt-4 rounded-lg bg-primary/10 p-3 text-sm text-primary">
                    💬 {translations.whatsappNote}
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
                        {translations.register}
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

