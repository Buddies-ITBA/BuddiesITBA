import Link from 'next/link';
import { CalendarCheck2, CalendarX2, CircleAlert } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { StatusMessage } from '@/components/feedback/StatusMessage';
import { findByCancelToken } from '@/lib/registrations';
import { pick } from '@/lib/localized';
import { confirmCancellation } from './actions';

export const metadata = { robots: { index: false } };

/**
 * Landing page for the "cancel my registration" email link. The GET only shows
 * a confirmation; cancelling needs a click (email scanners prefetch links).
 */
export default async function CancelRegistrationPage({ searchParams }: PageProps<'/events/cancel'>) {
  const sp = await searchParams;
  const [t, locale] = await Promise.all([getTranslations('events.cancel'), getLocale()]);

  if (sp.done) return <StatusMessage Icon={CalendarCheck2} title={t('title')} description={t('done')} />;

  const token = typeof sp.token === 'string' ? sp.token : '';
  const found = sp.invalid ? null : await findByCancelToken(token);
  if (!found) return <StatusMessage Icon={CircleAlert} title={t('title')} description={t('invalid')} />;

  const title = pick(found.event.title, locale);
  return (
    <StatusMessage Icon={CalendarX2} title={t('title')} description={t('description', { event: title })}>
      <form action={confirmCancellation.bind(null, token)}>
        <Button type="submit" variant="destructive">
          {t('confirm')}
        </Button>
      </form>
      <Button asChild variant="outline">
        <Link href={`/events/${found.event.slug}`}>{t('keep')}</Link>
      </Button>
    </StatusMessage>
  );
}
