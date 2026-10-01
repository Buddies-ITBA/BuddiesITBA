import { Compass, Home } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { StatusMessage } from '@/components/feedback/StatusMessage';

export default async function NotFound() {
  const t = await getTranslations('notFound');
  return (
    <StatusMessage Icon={Compass} title={t('title')} description={t('description')}>
      <Button asChild>
        <Link href="/">
          <Home />
          {t('home')}
        </Link>
      </Button>
    </StatusMessage>
  );
}
