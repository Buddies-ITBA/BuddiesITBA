'use client';

import { useTranslations } from 'next-intl';

/** Screen-reader label for dialog/sheet close buttons, localized by default. */
export function CloseLabel({ override }: { override?: string }) {
  const t = useTranslations('nav');
  return <span className="sr-only">{override ?? t('close')}</span>;
}
