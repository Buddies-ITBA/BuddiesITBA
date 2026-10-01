'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusMessage } from './StatusMessage';

type ErrorViewProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export function ErrorView({ error, retry }: ErrorViewProps) {
  const t = useTranslations('error');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusMessage
      Icon={AlertTriangle}
      title={t('title')}
      description={t('description')}
      footnote={error.digest ? t('errorId', { id: error.digest }) : undefined}
    >
      <Button onClick={retry}>
        <RefreshCw />
        {t('retry')}
      </Button>
      <Button asChild variant="outline">
        <Link href="/">
          <Home />
          {t('home')}
        </Link>
      </Button>
    </StatusMessage>
  );
}
