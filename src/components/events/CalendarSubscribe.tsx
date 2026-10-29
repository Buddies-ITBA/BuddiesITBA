import { CalendarSync } from 'lucide-react';
import { site } from '@/config/site';

/**
 * "Subscribe" opens the calendar app with the live feed (webcal://), so new
 * events show up automatically. Google Calendar gets its own add-by-URL link.
 */
export function CalendarSubscribe({ locale, label, hint }: { locale: string; label: string; hint: string }) {
  const feed = new URL(`/events/calendar.ics?lang=${locale}`, site.url);
  const webcal = feed.toString().replace(/^https?:/, 'webcal:');
  const google = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`;
  return (
    <div className="container-page -mt-4 max-w-4xl">
      <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-plane/50 bg-white/70 p-4 sm:flex-row sm:items-center">
        <CalendarSync className="size-6 shrink-0 text-primary" aria-hidden />
        <p className="flex-1 text-sm text-text-muted">{hint}</p>
        <div className="flex gap-2">
          <a href={google} target="_blank" rel="noopener noreferrer" className="rounded-full bg-primary px-4 py-2 font-nav text-xs font-semibold text-white hover:bg-primary-dark">
            Google Calendar
          </a>
          <a href={webcal} className="rounded-full bg-sky px-4 py-2 font-nav text-xs font-semibold text-primary hover:bg-sky/70">
            {label}
          </a>
        </div>
      </div>
    </div>
  );
}
