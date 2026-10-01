import { getLocale, getTranslations } from 'next-intl/server';
import { PageTitle } from '@/components/sections/PageTitle';
import { FaqAccordion } from '@/components/sections/FaqAccordion';
import { UsefulContactsSection } from '@/components/sections/UsefulContactsSection';
import { Markdown } from '@/components/ui/markdown';
import { listFaqs } from '@/lib/data/public';
import { pageMetadata } from '@/lib/metadata';

export const generateMetadata = () => pageMetadata('faq.page');

export default async function FaqPage() {
  const [t, faqs] = await Promise.all([getTranslations('faq'), getLocale().then(listFaqs)]);

  return (
    <>
      <PageTitle title={t('page.title')} description={t('page.description')} />
      <FaqAccordion
        faqs={faqs.map((faq) => ({ ...faq, answerNode: <Markdown className="prose-sm text-text-muted">{faq.answer}</Markdown> }))}
        translations={{
          label: t('search.label'),
          placeholder: t('search.placeholder'),
          all: t('search.all'),
          noResults: t.raw('search.noResults'),
          noResultsHint: t('search.noResultsHint'),
          empty: t('search.empty'),
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
