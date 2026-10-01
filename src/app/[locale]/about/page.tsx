import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageTitle } from '@/components/sections/PageTitle';
import { AboutIntroSection } from '@/components/sections/AboutIntroSection';
import { StatsSection } from '@/components/sections/StatsSection';
import { TeamSection } from '@/components/sections/TeamSection';
import { cms } from '@/lib/cms';
import { pageMetadata } from '@/lib/metadata';
import type { Locale } from '@/i18n/config';

export const generateMetadata = ({ params }: PageProps<'/[locale]/about'>) =>
  pageMetadata(params, 'about.page');

export default async function AboutPage({ params }: PageProps<'/[locale]/about'>) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);

  const [t, tStats, teamMembers] = await Promise.all([
    getTranslations('about'),
    getTranslations('home.stats'),
    cms.getTeamMembers(locale),
  ]);

  return (
    <>
      <PageTitle title={t('page.title')} description={t('page.description')} />
      <AboutIntroSection
        eyebrow={t('intro.eyebrow')}
        title={t('intro.title')}
        intro={t('intro.intro')}
        points={t.raw('intro.points')}
        closing={t('intro.closing')}
        imageAlt={t('intro.imageAlt')}
      />
      <StatsSection stats={tStats.raw('items')} />
      <TeamSection
        eyebrow={t('team.eyebrow')}
        title={t('team.title')}
        subtitle={t('team.subtitle')}
        members={teamMembers.map((member) => ({
          ...member,
          linkedinLabel: t('team.linkedin', { name: member.name }),
        }))}
      />
    </>
  );
}
