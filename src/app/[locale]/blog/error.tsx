'use client';

import { useTranslations } from 'next-intl';
import { ErrorView } from '@/components/feedback/ErrorView';

export default function BlogError(props: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('blog.error');
  return <ErrorView {...props} title={t('title')} description={t('description')} />;
}
