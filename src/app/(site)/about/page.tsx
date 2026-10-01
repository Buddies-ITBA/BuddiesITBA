import { getLocale, getTranslations } from 'next-intl/server';
import { PageTitle } from '@/components/sections/PageTitle';
import { AboutIntroSection } from '@/components/sections/AboutIntroSection';
import { StatsSection } from '@/components/sections/StatsSection';
import { TeamSection } from '@/components/sections/TeamSection';
import { getStats, listTeam } from '@/lib/data/public';
import { pageMetadata } from '@/lib/metadata';

export const generateMetadata = () => pageMetadata('about.page');

export default async function AboutPage() {
  const locale = await getLocale();
  const [t, stats, teamMembers] = await Promise.all([getTranslations('about'), getStats(locale), listTeam(locale)]);

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
      <StatsSection stats={stats} />
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
