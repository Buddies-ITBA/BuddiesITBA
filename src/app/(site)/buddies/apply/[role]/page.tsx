import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { buddyRoles, genders, genderPreferences, type BuddyRole } from '@/db/schema';
import { PageTitle } from '@/components/sections/PageTitle';
import { getActiveProgram } from '@/lib/data/public';
import { LANGUAGE_CODES, questionsFor } from '@/lib/buddies/applications';
import { localizeFields } from '@/lib/forms/localize';
import { countryFlag, countryOptions } from '@/lib/countries';
import { ApplicationForm } from './ApplicationForm';

export default async function ApplyPage({ params }: PageProps<'/buddies/apply/[role]'>) {
  const { role } = await params;
  if (!buddyRoles.includes(role as BuddyRole)) notFound();
  const program = await getActiveProgram();
  if (!program?.registrationOpen) redirect('/buddies');

  const [locale, t, tForms, tNav] = await Promise.all([
    getLocale(),
    getTranslations('buddies.apply'),
    getTranslations('forms'),
    getTranslations('nav'),
  ]);
  const isLocal = role === 'local';
  const title = isLocal ? t('titleLocal') : t('titleExchange');

  return (
    <>
      <PageTitle title={title} description={t('intro')} breadcrumbs={[{ label: tNav('buddies'), href: '/buddies' }, { label: title }]} />
      <section className="section pt-8">
        <div className="container-page max-w-3xl">
          <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-10">
            <ApplicationForm
              role={role as BuddyRole}
              questions={localizeFields(questionsFor(program, role as BuddyRole), locale)}
              genders={genders.map((g) => ({ value: g, label: t(`genders.${g}`) }))}
              genderPreferences={genderPreferences.map((g) => ({ value: g, label: t(`genderPreferences.${g}`) }))}
              languages={LANGUAGE_CODES.map((code) => ({ value: code, label: t(`languageNames.${code}`) }))}
              countries={countryOptions(locale).map((c) => ({ value: c.value, label: `${countryFlag(c.value)} ${c.label}` }))}
              labels={{
                sectionAbout: t('sectionAbout'),
                sectionMatching: t('sectionMatching'),
                name: tForms('name'),
                email: tForms('email'),
                phone: t('phone'),
                institution: isLocal ? t('institutionLocal') : t('institutionExchange'),
                country: t('country'),
                gender: t('gender'),
                genderPreference: t('genderPreference'),
                languages: t('languages'),
                capacity: t('capacity'),
                consent: tForms('consent'),
                submit: tForms('submit'),
                submitting: tForms('submitting'),
                optional: tForms('optional'),
                selectPlaceholder: tForms('selectPlaceholder'),
              }}
            />
          </div>
          <Link href="/buddies" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            <ArrowLeft className="size-4" aria-hidden />
            {t('back')}
          </Link>
        </div>
      </section>
    </>
  );
}
