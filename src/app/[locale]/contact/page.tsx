import { getTranslations } from 'next-intl/server';
import { PageTitle } from '@/components/sections/PageTitle';
import { ContactSection } from '@/components/sections/ContactSection';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const tPage = await getTranslations('contact.page');
  const tContact = await getTranslations('contact.section');
  const tNav = await getTranslations('nav');

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
      <ContactSection
        addressTitle={tContact('addressTitle')}
        addressLines={tContact.raw('addressLines')}
        emailTitle={tContact('emailTitle')}
        email={tContact('email')}
        formNamePlaceholder={tContact('form.name')}
        formEmailPlaceholder={tContact('form.email')}
        formSubjectPlaceholder={tContact('form.subject')}
        formMessagePlaceholder={tContact('form.message')}
        formSubmitLabel={tContact('form.submit')}
      />
    </>
  );
}
