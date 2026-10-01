import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { Copy, ExternalLink, Users } from 'lucide-react';
import { getDb, schema } from '@/db';
import { Button } from '@/components/ui/button';
import { ConfirmButton } from '@/components/admin/AdminForm';
import { PageHeader } from '@/components/admin/ui';
import { pick } from '@/lib/localized';
import { deleteEvent, duplicateEvent, saveEvent } from '../actions';
import { EventForm } from './EventForm';

export default async function AdminEventPage({ params, searchParams }: PageProps<'/admin/events/[id]'>) {
  const { id } = await params;
  const isNew = id === 'new';
  let event: schema.EventRow | null = null;
  if (!isNew) {
    const db = await getDb();
    [event] = await db.select().from(schema.events).where(eq(schema.events.id, id)).limit(1);
    if (!event) notFound();
  }
  const sp = await searchParams;
  const created = sp.created === '1';
  const duplicated = sp.duplicated === '1';

  return (
    <>
      <PageHeader
        title={event ? pick(event.title, 'es') : 'Nuevo evento'}
        back={{ href: '/admin/events', label: 'Eventos' }}
        actions={
          event && (
            <>
              {event.registrationType === 'form' && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/events/${event.id}/registrations`}>
                    <Users /> Anotados
                  </Link>
                </Button>
              )}
              {event.published && (
                <Button asChild variant="outline" size="sm">
                  <a href={`/events/${event.slug}`} target="_blank">
                    <ExternalLink /> Ver
                  </a>
                </Button>
              )}
              <form action={duplicateEvent.bind(null, event.id)}>
                <Button type="submit" variant="outline" size="sm">
                  <Copy /> Duplicar
                </Button>
              </form>
              <form action={deleteEvent.bind(null, event.id)}>
                <ConfirmButton variant="ghost" size="sm" className="text-red-700" message="¿Eliminar el evento y todas sus inscripciones? No se puede deshacer.">
                  Eliminar
                </ConfirmButton>
              </form>
            </>
          )
        }
      />
      {created && <p className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">Evento creado.</p>}
      {duplicated && (
        <p className="mb-6 rounded-xl bg-sky px-4 py-3 text-sm font-medium text-primary-dark">
          Copia creada como borrador, sin inscriptos. Cambiá la fecha y publicala cuando esté lista.
        </p>
      )}
      <EventForm event={event} action={saveEvent.bind(null, event?.id ?? null)} />
    </>
  );
}
