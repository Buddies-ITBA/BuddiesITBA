import { isLocale } from '@/i18n/config';
import { site } from '@/config/site';
import { generateIcsCalendar } from '@/lib/calendar';
import { listUpcomingEvents } from '@/lib/data/public';

/** Subscribable calendar with every upcoming event. `?lang=en` for English titles. */
export async function GET(request: Request) {
  const lang = new URL(request.url).searchParams.get('lang');
  const locale = isLocale(lang) ? lang : 'es';
  const events = await listUpcomingEvents(locale);
  const body = generateIcsCalendar(
    events.map((e) => ({ ...e, url: new URL(`/events/${e.slug}`, site.url).toString() })),
    site.name
  );
  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="buddies-itba.ics"',
      'Cache-Control': 'public, max-age=900',
    },
  });
}
