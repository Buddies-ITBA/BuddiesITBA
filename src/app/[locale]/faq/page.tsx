import ReactMarkdown from 'react-markdown';
import { getTranslations } from 'next-intl/server';
import { resolveLocale } from '@/i18n/server';
import { PageTitle } from '@/components/sections/PageTitle';
import { FaqAccordion } from '@/components/sections/FaqAccordion';
import { UsefulContactsSection } from '@/components/sections/UsefulContactsSection';
import { cms } from '@/lib/cms';
import { pageMetadata } from '@/lib/metadata';
import type { Locale } from '@/i18n/config';

export const generateMetadata = ({ params }: PageProps<'/[locale]/faq'>) =>
  pageMetadata(params, 'faq.page');

export default async function FaqPage({ params }: PageProps<'/[locale]/faq'>) {
  const locale = await resolveLocale(params);

  const [t, faqs] = await Promise.all([getTranslations('faq'), cms.getFAQs(locale)]);

  return (
    <>
      <PageTitle title={t('page.title')} description={t('page.description')} />
      <FaqAccordion
        faqs={faqs.map((faq) => ({ ...faq, answerNode: <ReactMarkdown>{faq.answer}</ReactMarkdown> }))}
        translations={{
          label: t('search.label'),
          placeholder: t('search.placeholder'),
          all: t('search.all'),
          noResults: t.raw('search.noResults'),
          noResultsHint: t('search.noResultsHint'),
        }}
      />
      <UsefulContactsSection
        eyebrow={t('contacts.eyebrow')}
        title={t('contacts.title')}
        subtitle={t('contacts.subtitle')}
        contacts={t.raw('contacts.items')}
      />
    </>
  );
}
