import { getCurrentAdmin } from '@/lib/auth/session';
import { csvResponse } from '@/lib/csv';
import { getProgram, getProgramData } from '@/lib/admin/buddies';
import { formatAnswer } from '@/lib/admin/registrations';
import { pick } from '@/lib/localized';
import { slugify } from '@/lib/text';

/** ?type=matches (pairs with contact info, for intros) or ?type=applicants (everything). */
export async function GET(request: Request, { params }: RouteContext<'/admin/buddies/[id]/csv'>) {
  if (!(await getCurrentAdmin())) return new Response('Unauthorized', { status: 401 });
  const program = await getProgram((await params).id);
  if (!program) return new Response('Not found', { status: 404 });
  const { applicants, matches } = await getProgramData(program.id);
  const byId = new Map(applicants.map((a) => [a.id, a]));
  const name = slugify(program.name);

  if (new URL(request.url).searchParams.get('type') === 'matches') {
    return csvResponse(`matches-${name}.csv`, [
      ['Buddy ITBA', 'Email ITBA', 'WhatsApp ITBA', 'Intercambio', 'Email intercambio', 'WhatsApp intercambio', 'País', 'Universidad', 'Compatibilidad', 'Bloqueado'],
      ...matches.map((m) => {
        const l = byId.get(m.localId);
        const e = byId.get(m.exchangeId);
        return [l?.name, l?.email, l?.phone, e?.name, e?.email, e?.phone, e?.country, e?.institution, `${Math.round(m.score * 100)}%`, m.locked ? 'Sí' : 'No'];
      }),
    ]);
  }

  return csvResponse(`postulantes-${name}.csv`, [
    ['Rol', 'Nombre', 'Email', 'WhatsApp', 'Institución', 'País', 'Género', 'Pref. género', 'Idiomas', 'Capacidad', 'Fecha', 'Notas', ...program.questions.map((q) => pick(q.label, 'es'))],
    ...applicants.map((a) => [
      a.role === 'local' ? 'ITBA' : 'Intercambio',
      a.name,
      a.email,
      a.phone,
      a.institution,
      a.country,
      a.gender,
      a.genderPreference,
      a.languages,
      a.role === 'local' ? a.capacity : '',
      a.createdAt.toISOString(),
      a.notes,
      ...program.questions.map((q) => formatAnswer(q, a.answers[q.id])),
    ]),
  ]);
}
