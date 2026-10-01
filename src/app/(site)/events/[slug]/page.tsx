import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, CalendarClock, MessageCircle, Users } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { getEventBySlug } from '@/lib/data/public';
import { formatEventDate } from '@/lib/dates';
import { localizeFields } from '@/lib/forms/localize';
import { isRegistrationOpen } from '@/lib/registrations';
import { Button } from '@/components/ui/button';
import { Markdown } from '@/components/ui/markdown';
import { AddToCalendar } from '@/components/ui/add-to-calendar';
import { EventMeta, ExchangeOnlyBadge } from '@/components/events/badges';
import { RegistrationForm } from './RegistrationForm';

type Props = PageProps<'/events/[slug]'>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEventBySlug((await params).slug, await getLocale());
  if (!event) return {};
  return {
    title: event.title,
    description: event.summary,
    openGraph: { title: event.title, description: event.summary, ...(event.imageUrl && { images: [event.imageUrl] }) },
  };
}

export default async function EventPage({ params }: Props) {
  const locale = await getLocale();
  const event = await getEventBySlug((await params).slug, locale);
  if (!event) notFound();

  const [t, tTimeline, tCalendar, tForms] = await Promise.all([
    getTranslations('events.detail'),
    getTranslations('events.timeline'),
    getTranslations('events.calendar'),
    getTranslations('forms'),
  ]);

  const open = isRegistrationOpen(event);
  const spotsLeft = event.capacity === null ? null : Math.max(event.capacity - event.confirmedCount, 0);

  return (
    <article>
      <header className="relative isolate overflow-hidden bg-primary-dark text-white">
        {event.imageUrl && (
          <Image src={event.imageUrl} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-primary-dark via-primary-dark/80 to-primary-dark/40" />
        <div className="container-page pb-12 pt-10 md:pb-16">
          <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white">
            <ArrowLeft className="size-4" aria-hidden />
            {t('back')}
          </Link>
          <div className="mt-16 max-w-3xl md:mt-24">
            {event.exchangeOnly && <ExchangeOnlyBadge label={tTimeline('exchangeOnly')} className="mb-4" />}
            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">{event.title}</h1>
            <p className="mt-4 text-lg text-white/85">{event.summary}</p>
            <EventMeta event={event} locale={locale} capacityLabel={tTimeline('capacity')} className="mt-6 text-white/90 [&_svg]:text-sun" />
          </div>
        </div>
      </header>

      <div className="container-page section grid gap-12 pt-12 lg:grid-cols-[1fr_400px]">
        <div>
          {event.body ? <Markdown>{event.body}</Markdown> : null}
          <AddToCalendar
            event={event}
            labels={{ add: tCalendar('add'), google: tCalendar('google'), ics: tCalendar('ics') }}
            className="mt-8"
          />
        </div>

        <aside id="registration" aria-labelledby="registration-title" className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
            <h2 id="registration-title" className="text-2xl font-bold">
              {t('registration')}
            </h2>

            {event.registrationType === 'form' &&
              (open ? (
                <>
                  <div className="mt-3 space-y-1 text-sm text-text-muted">
                    {event.registrationDeadline && (
                      <p className="flex items-center gap-1.5">
                        <CalendarClock className="size-4 text-primary" aria-hidden />
                        {t('deadline', { date: formatEventDate(event.registrationDeadline, locale, 'weekdayLong') })}
                      </p>
                    )}
                    {spotsLeft !== null && (
                      <p className="flex items-center gap-1.5 font-medium">
                        <Users className="size-4 text-primary" aria-hidden />
                        {spotsLeft > 0 ? t('spotsLeft', { count: spotsLeft }) : t('full')}
                      </p>
                    )}
                  </div>
                  <div className="mt-6">
                    <RegistrationForm
                      slug={event.slug}
                      fields={localizeFields(event.formFields, locale)}
                      labels={{
                        name: tForms('name'),
                        email: tForms('email'),
                        consent: tForms('consent'),
                        submit: tTimeline('register'),
                        submitting: tForms('submitting'),
                        optional: tForms('optional'),
                        selectPlaceholder: tForms('selectPlaceholder'),
                      }}
                    />
                  </div>
                </>
              ) : (
                <p className="mt-3 text-text-muted">{t('closed')}</p>
              ))}

            {event.registrationType === 'link' && event.registrationUrl && (
              <Button asChild size="lg" className="mt-6 w-full">
                <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                  {t('external')}
                  <ArrowUpRight />
                </a>
              </Button>
            )}

            {event.registrationType === 'whatsapp' && (
              <p className="mt-4 flex items-start gap-2 font-medium text-[#166534]">
                <MessageCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
                {t('whatsapp')}
              </p>
            )}

            {event.registrationType === 'none' && <p className="mt-3 text-text-muted">{t('noRegistration')}</p>}
          </div>
        </aside>
      </div>
    </article>
  );
}
