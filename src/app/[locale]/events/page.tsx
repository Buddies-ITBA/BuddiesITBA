import { getTranslations } from 'next-intl/server';
import { PageTitle } from '@/components/sections/PageTitle';
import { EventsTimeline } from '@/components/sections/EventsTimeline';
import { cms } from '@/lib/cms';
import { Locale } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function EventsPage({ params }: Props) {
  const { locale } = await params;
  const tPage = await getTranslations('events.page');
  const tTimeline = await getTranslations('events.timeline');
  const tNav = await getTranslations('nav');

  // Fetch upcoming events from Notion CMS
  const events = await cms.getUpcomingEvents(locale as Locale);

  return (
    <>
      <PageTitle
        title={tPage('title')}
        description={tPage('description')}
        breadcrumbs={[
          { label: tNav('home'), href: `/${locale}` },
          { label: tPage('breadcrumb') },
        ]}
      />
      <EventsTimeline
        events={events}
        locale={locale}
        translations={{
          empty: tTimeline('empty'),
          capacity: tTimeline('capacity'),
          whatsappNote: tTimeline('whatsappNote'),
          register: tTimeline('register'),
        }}
      />
    </>
  );
}
