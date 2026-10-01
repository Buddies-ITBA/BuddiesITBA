import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageTitle } from '@/components/sections/PageTitle';
import { EventsTimeline } from '@/components/sections/EventsTimeline';
import { cms } from '@/lib/cms';
import { pageMetadata } from '@/lib/metadata';
import type { Locale } from '@/i18n/config';

export const generateMetadata = ({ params }: PageProps<'/[locale]/events'>) =>
  pageMetadata(params, 'events.page');

export default async function EventsPage({ params }: PageProps<'/[locale]/events'>) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);

  const [tPage, t, tCalendar, tCta, tNav, events] = await Promise.all([
    getTranslations('events.page'),
    getTranslations('events.timeline'),
    getTranslations('events.calendar'),
    getTranslations('home.cta'),
    getTranslations('nav'),
    cms.getUpcomingEvents(locale),
  ]);

  return (
    <>
      <PageTitle title={tPage('title')} description={tPage('description')} />
      <EventsTimeline
        events={events}
        locale={locale}
        translations={{
          empty: t('empty'),
          emptyHint: t('emptyHint'),
          capacity: t('capacity'),
          whatsappNote: t('whatsappNote'),
          register: t('register'),
          exchangeOnly: t('exchangeOnly'),
          details: t('details'),
          loadError: t('loadError'),
          instagram: tCta('instagram'),
          close: tNav('close'),
          calendar: { add: tCalendar('add'), google: tCalendar('google'), ics: tCalendar('ics') },
        }}
      />
    </>
  );
}
