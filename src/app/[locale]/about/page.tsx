import { getTranslations } from 'next-intl/server';
import { PageTitle } from '@/components/sections/PageTitle';
import { AboutIntroSection } from '@/components/sections/AboutIntroSection';
import { StatsSection } from '@/components/sections/StatsSection';
import { TeamSection } from '@/components/sections/TeamSection';
import { cms } from '@/lib/cms';
import { Locale } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const tPage = await getTranslations('about.page');
  const tIntro = await getTranslations('about.intro');
  const tStats = await getTranslations('about.stats');
  const tTeam = await getTranslations('about.team');
  const tNav = await getTranslations('nav');

  const teamMembers = await cms.getTeamMembers(locale as Locale);

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
      <AboutIntroSection
        intro={tIntro('intro')}
        points={tIntro.raw('points')}
        closing={tIntro('closing')}
        imageAlt={tIntro('imageAlt')}
      />
      <StatsSection stats={tStats.raw('items')} />
      <TeamSection
        title={tTeam('title')}
        subtitle={tTeam('subtitle')}
        members={teamMembers}
      />
    </>
  );
}
