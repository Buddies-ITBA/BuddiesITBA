import 'server-only';
import { getTranslations } from 'next-intl/server';
import { availabilityOf } from '@/components/events/badges';
import type { PublicEvent } from './public';

export type EventWithAvailability = PublicEvent & { availability: { state: 'open' | 'lastSpots' | 'full' | 'closed'; label: string } | null };

/** Adds a translated availability label ("Últimos 3 lugares") to each event. */
export async function withAvailability(events: PublicEvent[]): Promise<EventWithAvailability[]> {
  const t = await getTranslations('events.availability');
  return events.map((event) => {
    const a = availabilityOf(event);
    return { ...event, availability: a && { state: a.state, label: a.state === 'lastSpots' ? t('lastSpots', { count: a.count }) : t(a.state) } };
  });
}
