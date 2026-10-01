import Link from 'next/link';
import { desc, eq, sql } from 'drizzle-orm';
import { Plus } from 'lucide-react';
import { getDb, schema } from '@/db';
import { Button } from '@/components/ui/button';
import { Badge, EmptyRow, PageHeader, Table, td, th } from '@/components/admin/ui';
import { formatEventDate } from '@/lib/dates';
import { pick } from '@/lib/localized';

export const metadata = { title: 'Eventos' };

const registrationLabels = { none: 'Sin inscripción', whatsapp: 'WhatsApp', link: 'Link externo', form: 'Formulario' } as const;

export default async function AdminEventsPage() {
  const db = await getDb();
  const { events, eventRegistrations: r } = schema;
  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      startsAt: events.startsAt,
      published: events.published,
      showInHome: events.showInHome,
      registrationType: events.registrationType,
      capacity: events.capacity,
      isPast: sql<boolean>`${events.startsAt} < now()`,
      confirmed: sql<number>`count(${r.id}) filter (where ${r.status} = 'confirmed')`.mapWith(Number),
      waitlist: sql<number>`count(${r.id}) filter (where ${r.status} = 'waitlist')`.mapWith(Number),
    })
    .from(events)
    .leftJoin(r, eq(r.eventId, events.id))
    .groupBy(events.id)
    .orderBy(desc(events.startsAt));

  return (
    <>
      <PageHeader
        title="Eventos"
        description="Lo que se publica en /events. Los eventos con formulario juntan inscripciones acá mismo."
        actions={
          <Button asChild>
            <Link href="/admin/events/new">
              <Plus /> Nuevo evento
            </Link>
          </Button>
        }
      />
      <Table>
        <thead className="bg-sky/40">
          <tr>
            <th className={th}>Fecha</th>
            <th className={th}>Evento</th>
            <th className={th}>Estado</th>
            <th className={th}>Inscripción</th>
            <th className={th}>Anotados</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.length === 0 && <EmptyRow colSpan={5}>Todavía no hay eventos.</EmptyRow>}
          {rows.map((event) => (
            <tr key={event.id} className={event.isPast ? 'opacity-60' : undefined}>
              <td className={`${td} whitespace-nowrap`}>{formatEventDate(event.startsAt, 'es', 'long')}</td>
              <td className={td}>
                <Link href={`/admin/events/${event.id}`} className="font-semibold text-primary hover:underline">
                  {pick(event.title, 'es')}
                </Link>
              </td>
              <td className={`${td} space-x-1`}>
                {event.published ? <Badge tone="green">Publicado</Badge> : <Badge tone="gray">Borrador</Badge>}
                {event.showInHome && <Badge>Home</Badge>}
              </td>
              <td className={td}>{registrationLabels[event.registrationType]}</td>
              <td className={td}>
                {event.registrationType === 'form' ? (
                  <Link href={`/admin/events/${event.id}/registrations`} className="font-semibold text-primary hover:underline">
                    {event.confirmed}
                    {event.capacity ? ` / ${event.capacity}` : ''}
                    {event.waitlist > 0 && <span className="ml-1 text-xs text-amber-700">(+{event.waitlist} en espera)</span>}
                  </Link>
                ) : (
                  <span className="text-text-muted">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
