import { getTranslations } from 'next-intl/server';
import { HeroSection } from '@/components/sections/HeroSection';
import { HomeAboutSection } from '@/components/sections/HomeAboutSection';
import { StatsSection } from '@/components/sections/StatsSection';
import { EventsPreviewSection } from '@/components/sections/EventsPreviewSection';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const tHero = await getTranslations('home.hero');
  const tAbout = await getTranslations('home.about');
  const tStats = await getTranslations('home.stats');
  const tEvents = await getTranslations('home.events');

  return (
    <main>
      <HeroSection
        title={tHero('title')}
        subtitle={tHero('subtitle')}
        imageAlt={tHero('imageAlt')}
      />
      <HomeAboutSection
        locale={locale}
        title={tAbout('title')}
        subtitle={tAbout('subtitle')}
        highlights={tAbout.raw('highlights')}
        ctaLabel={tAbout('cta')}
        imageAlt={tAbout('imageAlt')}
      />
      <StatsSection stats={tStats.raw('items')} />
      <EventsPreviewSection
        title={tEvents('title')}
        subtitle={tEvents('subtitle')}
        events={tEvents.raw('items')}
      />
    </main>
  );
}
