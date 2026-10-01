import { getLocale, getTranslations } from 'next-intl/server';
import { HeroSection } from '@/components/sections/HeroSection';
import { StepsSection } from '@/components/sections/StepsSection';
import { HomeAboutSection } from '@/components/sections/HomeAboutSection';
import { StatsSection } from '@/components/sections/StatsSection';
import { EventsPreviewSection } from '@/components/sections/EventsPreviewSection';
import { PassportStamps } from '@/components/sections/PassportStamps';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { GalleryStrip } from '@/components/sections/GalleryStrip';
import { CtaBand } from '@/components/sections/CtaBand';
import { getSiteSettings, getStats, listCommunityCountries, listGallery, listHomeEvents, listTestimonials } from '@/lib/data/public';
import { withAvailability } from '@/lib/data/availability';
import { countryFlag, countryName } from '@/lib/countries';

export default async function HomePage() {
  const locale = await getLocale();
  const [t, tTimeline, homeEvents, stats, countries, testimonials, photos, settings] = await Promise.all([
    getTranslations('home'),
    getTranslations('events.timeline'),
    listHomeEvents(locale).then(withAvailability),
    getStats(locale),
    listCommunityCountries(),
    listTestimonials(locale),
    listGallery(locale),
    getSiteSettings(),
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
      <StepsSection eyebrow={t('steps.eyebrow')} title={t('steps.title')} subtitle={t('steps.subtitle')} steps={t.raw('steps.items')} />
      <EventsPreviewSection
        eyebrow={t('events.eyebrow')}
        title={t('events.title')}
        subtitle={t('events.subtitle')}
        viewAll={t('events.viewAll')}
        events={homeEvents}
        locale={locale}
        exchangeOnlyLabel={tTimeline('exchangeOnly')}
      />
      <StatsSection stats={stats} />
      <PassportStamps
        eyebrow={t('countries.eyebrow')}
        title={t('countries.title', { count: countries.length })}
        subtitle={t('countries.subtitle')}
        stamps={countries.slice(0, 18).map(({ code }) => ({ code, name: countryName(code, locale), flag: countryFlag(code) }))}
      />
      <TestimonialsSection
        eyebrow={t('testimonials.eyebrow')}
        title={t('testimonials.title')}
        subtitle={t('testimonials.subtitle')}
        testimonials={testimonials.map((x) => ({ ...x, flag: x.countryCode ? countryFlag(x.countryCode) : '' }))}
      />
      <HomeAboutSection
        eyebrow={t('about.eyebrow')}
        title={t('about.title')}
        subtitle={t('about.subtitle')}
        highlights={t.raw('about.highlights')}
        ctaLabel={t('about.cta')}
        imageAlt={t('about.imageAlt')}
      />
      <GalleryStrip eyebrow={t('gallery.eyebrow')} title={t('gallery.title')} instagramLabel={t('gallery.instagram')} photos={photos} />
      <CtaBand
        title={t('cta.title')}
        description={t('cta.description')}
        instagramLabel={t('cta.instagram')}
        contactLabel={t('cta.contact')}
        whatsapp={settings.whatsappUrl ? { url: settings.whatsappUrl, label: t('whatsapp') } : undefined}
      />
    </>
  );
}
