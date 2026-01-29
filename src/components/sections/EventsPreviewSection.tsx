import Image from 'next/image';

type EventPreview = {
  title: string;
  description: string;
  image: string;
};

type EventsPreviewSectionProps = {
  title: string;
  subtitle: string;
  events: EventPreview[];
};

export function EventsPreviewSection({
  title,
  subtitle,
  events,
}: EventsPreviewSectionProps) {
  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-heading">
            {title}
          </h2>
          <p className="mt-2 text-text-muted">{subtitle}</p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <article
              key={event.title}
              className="overflow-hidden rounded-2xl bg-surface shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <Image
                src={event.image}
                alt={event.title}
                width={800}
                height={600}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="h-48 w-full object-cover"
              />
              <div className="p-5">
                <h3 className="text-lg font-heading font-semibold text-heading">
                  {event.title}
                </h3>
                <p className="mt-2 text-sm text-text-muted">{event.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

