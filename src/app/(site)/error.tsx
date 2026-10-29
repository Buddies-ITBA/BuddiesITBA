'use client';

import { ErrorView } from '@/components/feedback/ErrorView';

export default function Error(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorView {...props} />;
}
