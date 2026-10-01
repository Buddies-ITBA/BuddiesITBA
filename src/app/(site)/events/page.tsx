import { getLocale, getTranslations } from 'next-intl/server';
import { PageTitle } from '@/components/sections/PageTitle';
import { EventsTimeline } from '@/components/sections/EventsTimeline';
import { listUpcomingEvents } from '@/lib/data/public';
import { pageMetadata } from '@/lib/metadata';

export const generateMetadata = () => pageMetadata('events.page');

export default async function EventsPage() {
  const locale = await getLocale();
  const [tPage, t, tCalendar, tCta, events] = await Promise.all([
    getTranslations('events.page'),
    getTranslations('events.timeline'),
    getTranslations('events.calendar'),
    getTranslations('home.cta'),
    listUpcomingEvents(locale),
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
          exchangeOnly: t('exchangeOnly'),
          details: t('details'),
          instagram: tCta('instagram'),
          calendar: { add: tCalendar('add'), google: tCalendar('google'), ics: tCalendar('ics') },
        }}
      />
    </>
  );
}
