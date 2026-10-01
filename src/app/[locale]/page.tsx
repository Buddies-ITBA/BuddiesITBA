import { getTranslations } from 'next-intl/server';
import { resolveLocale } from '@/i18n/server';
import { HeroSection } from '@/components/sections/HeroSection';
import { StepsSection } from '@/components/sections/StepsSection';
import { HomeAboutSection } from '@/components/sections/HomeAboutSection';
import { StatsSection } from '@/components/sections/StatsSection';
import { EventsPreviewSection } from '@/components/sections/EventsPreviewSection';
import { CtaBand } from '@/components/sections/CtaBand';
import { cms } from '@/lib/cms';
import type { Locale } from '@/i18n/config';

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const locale = await resolveLocale(params);

  const [t, tTimeline, homeEvents] = await Promise.all([
    getTranslations('home'),
    getTranslations('events.timeline'),
    cms.getHomeEvents(locale),
  ]);

  return (
    <>
      <HeroSection
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        primaryCta={t('hero.primaryCta')}
        secondaryCta={t('hero.secondaryCta')}
        imageAlt={t('hero.imageAlt')}
      />
      <StepsSection
        eyebrow={t('steps.eyebrow')}
        title={t('steps.title')}
        subtitle={t('steps.subtitle')}
        steps={t.raw('steps.items')}
      />
      <StatsSection stats={t.raw('stats.items')} />
      <HomeAboutSection
        eyebrow={t('about.eyebrow')}
        title={t('about.title')}
        subtitle={t('about.subtitle')}
        highlights={t.raw('about.highlights')}
        ctaLabel={t('about.cta')}
        imageAlt={t('about.imageAlt')}
      />
      <EventsPreviewSection
        eyebrow={t('events.eyebrow')}
        title={t('events.title')}
        subtitle={t('events.subtitle')}
        viewAll={t('events.viewAll')}
        events={homeEvents}
        exchangeOnlyLabel={tTimeline('exchangeOnly')}
      />
      <CtaBand
        title={t('cta.title')}
        description={t('cta.description')}
        instagramLabel={t('cta.instagram')}
        contactLabel={t('cta.contact')}
      />
    </>
  );
}
