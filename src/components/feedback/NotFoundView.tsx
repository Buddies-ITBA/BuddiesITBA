import Link from 'next/link';
import { Compass, Home } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { StatusMessage } from './StatusMessage';

export async function NotFoundView() {
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
