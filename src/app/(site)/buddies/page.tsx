import Link from 'next/link';
import { ArrowRight, GraduationCap, Plane } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { PageTitle } from '@/components/sections/PageTitle';
import { StepsSection } from '@/components/sections/StepsSection';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/button';
import { InstagramIcon } from '@/components/brand/social-icons';
import { SectionHeading } from '@/components/ui/section-heading';
import { site } from '@/config/site';
import { getActiveProgram, listTestimonials } from '@/lib/data/public';
import { MatchingExplainer } from '@/components/sections/MatchingExplainer';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { countryFlag } from '@/lib/countries';
import { pageMetadata } from '@/lib/metadata';

export const generateMetadata = () => pageMetadata('buddies.page');

export default async function BuddiesPage() {
  const [t, tHome, tCta, program, testimonials] = await Promise.all([
    getTranslations('buddies'),
    getTranslations('home'),
    getTranslations('home.cta'),
    getActiveProgram(),
    getLocale().then(listTestimonials),
  ]);
  const open = program?.registrationOpen ?? false;

  const roles = [
    { key: 'exchange', Icon: Plane },
    { key: 'local', Icon: GraduationCap },
  ] as const;

  return (
    <>
      <PageTitle title={t('page.title')} description={t('page.description')} />

      <section className="section pt-8 md:pt-12">
        <div className="container-page">
          {open ? (
            <>
              <SectionHeading title={t('choose.title')} subtitle={t('choose.subtitle')} />
              <ul className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
                {roles.map(({ key, Icon }) => (
                  <li key={key}>
                    <Link
                      href={`/buddies/apply/${key}`}
                      className="group flex h-full flex-col rounded-3xl border bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    >
                      <span className="grid size-14 place-items-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                        <Icon className="size-7" aria-hidden />
                      </span>
                      <h2 className="mt-6 text-2xl font-bold">{t(`roles.${key}.title`)}</h2>
                      <p className="mt-2 flex-1 text-text-muted">{t(`roles.${key}.description`)}</p>
                      <span className="mt-6 inline-flex items-center gap-2 font-nav font-semibold text-primary">
                        {t(`roles.${key}.cta`)}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptyState Icon={Plane} title={t('closed.title')} hint={t('closed.description')}>
              <Button asChild>
                <a href={site.instagram.url} target="_blank" rel="noopener noreferrer">
                  <InstagramIcon />
                  {tCta('instagram')}
                </a>
              </Button>
            </EmptyState>
          )}
        </div>
      </section>

      <MatchingExplainer eyebrow={t('how.eyebrow')} title={t('how.title')} subtitle={t('how.subtitle')} items={t.raw('how.items')} />
      <TestimonialsSection
        eyebrow={tHome('testimonials.eyebrow')}
        title={tHome('testimonials.title')}
        subtitle={tHome('testimonials.subtitle')}
        testimonials={testimonials.map((x) => ({ ...x, flag: x.countryCode ? countryFlag(x.countryCode) : '' }))}
      />
      <StepsSection
        eyebrow={tHome('steps.eyebrow')}
        title={tHome('steps.title')}
        subtitle={tHome('steps.subtitle')}
        steps={tHome.raw('steps.items')}
      />
    </>
  );
}
