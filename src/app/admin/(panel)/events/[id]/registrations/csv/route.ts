import { getCurrentAdmin } from '@/lib/auth/session';
import { csvResponse } from '@/lib/csv';
import { formatAnswer, getEventWithRegistrations, statusLabels } from '@/lib/admin/registrations';
import { pick } from '@/lib/localized';

export async function GET(_request: Request, { params }: RouteContext<'/admin/events/[id]/registrations/csv'>) {
  if (!(await getCurrentAdmin())) return new Response('Unauthorized', { status: 401 });
  const data = await getEventWithRegistrations((await params).id);
  if (!data) return new Response('Not found', { status: 404 });

  const { event, registrations } = data;
  const fields = event.formFields;
  return csvResponse(`inscriptos-${event.slug}.csv`, [
    ['Nombre', 'Email', 'Estado', 'Fecha', ...fields.map((f) => pick(f.label, 'es'))],
    ...registrations.map((r) => [
      r.name,
      r.email,
      statusLabels[r.status],
      r.createdAt.toISOString(),
      ...fields.map((f) => formatAnswer(f, r.answers[f.id])),
    ]),
  ]);
}
