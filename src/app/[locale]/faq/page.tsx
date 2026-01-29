import { getTranslations } from 'next-intl/server';
import { PageTitle } from '@/components/sections/PageTitle';
import { FaqAccordion } from '@/components/sections/FaqAccordion';
import { UsefulContactsSection } from '@/components/sections/UsefulContactsSection';
import { cms } from '@/lib/cms';
import { Locale } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  const tPage = await getTranslations('faq.page');
  const tContacts = await getTranslations('faq.contacts');
  const tNav = await getTranslations('nav');

  // Fetch FAQs from Notion CMS
  const faqs = await cms.getFAQs(locale as Locale);

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
      <FaqAccordion faqs={faqs} />
      <UsefulContactsSection
        title={tContacts('title')}
        subtitle={tContacts('subtitle')}
        contacts={tContacts.raw('items')}
      />
    </>
  );
}
