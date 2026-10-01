import { getTranslations } from 'next-intl/server';
import { PageTitle } from '@/components/sections/PageTitle';
import { ContactSection } from '@/components/sections/ContactSection';
import { pageMetadata } from '@/lib/metadata';

export const generateMetadata = () => pageMetadata('contact.page');

export default async function ContactPage() {
  const t = await getTranslations('contact');

  return (
    <>
      <PageTitle title={t('page.title')} description={t('page.description')} />
      <ContactSection
        addressTitle={t('section.addressTitle')}
        addressLines={t.raw('section.addressLines')}
        directions={t('section.directions')}
        emailTitle={t('section.emailTitle')}
        emailDescription={t('section.emailDescription')}
        emailButton={t('section.emailButton')}
        instagramTitle={t('section.instagramTitle')}
        instagramDescription={t('section.instagramDescription')}
        instagramButton={t('section.instagramButton')}
        mapTitle={t('section.mapTitle')}
      />
    </>
  );
}
