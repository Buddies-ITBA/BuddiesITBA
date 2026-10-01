import { notFound } from 'next/navigation';
import { Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmButton } from '@/components/admin/AdminForm';
import { Badge, EmptyRow, PageHeader, Table, td, th } from '@/components/admin/ui';
import { formatAnswer, getEventWithRegistrations, statusLabels } from '@/lib/admin/registrations';
import { formatEventDate } from '@/lib/dates';
import { pick } from '@/lib/localized';
import { normalize } from '@/lib/search';
import { adminInput } from '@/components/admin/ui';
import { changeRegistrationStatus, deleteRegistration } from '../../actions';

export const metadata = { title: 'Anotados' };

const tones = { confirmed: 'green', waitlist: 'amber', cancelled: 'gray' } as const;

export default async function RegistrationsPage({ params, searchParams }: PageProps<'/admin/events/[id]/registrations'>) {
  const { id } = await params;
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q.trim() : '';
  const statusFilter = typeof sp.status === 'string' && sp.status in statusLabels ? sp.status : '';
  const data = await getEventWithRegistrations(id);
  if (!data) notFound();
  const { event, registrations } = data;
  const counts = registrations.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {});
  const needle = normalize(q);
  const visible = registrations.filter(
    (r) =>
      (!statusFilter || r.status === statusFilter) &&
      (!needle || normalize(`${r.name} ${r.email} ${event.formFields.map((f) => formatAnswer(f, r.answers[f.id])).join(' ')}`).includes(needle))
  );

  return (
    <>
      <PageHeader
        title={`Anotados · ${pick(event.title, 'es')}`}
        description={`${counts.confirmed ?? 0} confirmados${event.capacity ? ` de ${event.capacity}` : ''} · ${counts.waitlist ?? 0} en espera · ${counts.cancelled ?? 0} cancelados`}
        back={{ href: `/admin/events/${event.id}`, label: 'Volver al evento' }}
        actions={
          <Button asChild variant="outline">
            <a href={`/admin/events/${event.id}/registrations/csv`}>
              <Download /> Exportar CSV
            </a>
          </Button>
        }
      />
      <form className="mb-4 flex flex-wrap gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Buscar por nombre, email o respuesta…" aria-label="Buscar" className={`${adminInput} max-w-xs`} />
        <select name="status" defaultValue={statusFilter} aria-label="Estado" className={`${adminInput} w-auto`}>
          <option value="">Todos los estados</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
        {(q || statusFilter) && (
          <p className="self-center text-sm text-text-muted">
            {visible.length} de {registrations.length}
          </p>
        )}
      </form>
      <Table>
        <thead className="bg-sky/40">
          <tr>
            <th className={th}>#</th>
            <th className={th}>Persona</th>
            {event.formFields.map((f) => (
              <th key={f.id} className={th}>
                {pick(f.label, 'es')}
              </th>
            ))}
            <th className={th}>Estado</th>
            <th className={th}>
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {visible.length === 0 && <EmptyRow colSpan={event.formFields.length + 4}>{registrations.length ? 'Nadie coincide con el filtro.' : 'Todavía no se anotó nadie.'}</EmptyRow>}
          {visible.map((r, i) => (
            <tr key={r.id} className={r.status === 'cancelled' ? 'opacity-50' : undefined}>
              <td className={`${td} text-text-muted`}>{i + 1}</td>
              <td className={td}>
                <p className="font-semibold">{r.name}</p>
                <a href={`mailto:${r.email}`} className="text-xs text-primary hover:underline">
                  {r.email}
                </a>
                <p className="text-xs text-text-muted">{formatEventDate(r.createdAt, 'es', 'long')}</p>
              </td>
              {event.formFields.map((f) => (
                <td key={f.id} className={td}>
                  {formatAnswer(f, r.answers[f.id])}
                </td>
              ))}
              <td className={td}>
                <form action={changeRegistrationStatus.bind(null, r.id)} className="flex items-center gap-2">
                  <Badge tone={tones[r.status]}>{statusLabels[r.status]}</Badge>
                  <select name="status" defaultValue={r.status} aria-label="Cambiar estado" className="rounded-md border bg-white px-1.5 py-1 text-xs">
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="text-xs font-semibold text-primary hover:underline">
                    Cambiar
                  </button>
                </form>
              </td>
              <td className={td}>
                <form action={deleteRegistration.bind(null, r.id)}>
                  <ConfirmButton variant="ghost" size="icon" aria-label="Eliminar inscripción" message={`¿Eliminar la inscripción de ${r.name}?`}>
                    <Trash2 />
                  </ConfirmButton>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
