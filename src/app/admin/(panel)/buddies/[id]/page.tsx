import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Download, Lock, LockOpen, Sparkles, Trash2, X } from 'lucide-react';
import type { BuddyApplicantRow, BuddyProgramRow } from '@/db/schema';
import { Button } from '@/components/ui/button';
import { AdminForm, ConfirmButton, SaveButton } from '@/components/admin/AdminForm';
import { FormBuilder } from '@/components/admin/FormBuilder';
import { adminInput, Badge, Card, EmptyRow, Field, PageHeader, Table, td, th, Toggle } from '@/components/admin/ui';
import { getProgram, getProgramData, matchingQuestions, matchReasons } from '@/lib/admin/buddies';
import { formatAnswer } from '@/lib/admin/registrations';
import { pick } from '@/lib/localized';
import { cn } from '@/lib/utils';
import {
  assignManually,
  clearUnlockedMatches,
  deleteApplicant,
  deleteProgram,
  generateMatches,
  removeMatch,
  saveApplicantNotes,
  saveQuestions,
  toggleMatchLock,
  updateProgramSettings,
} from '../actions';

const tabs = [
  { key: 'applicants', label: 'Postulantes' },
  { key: 'matching', label: 'Matching' },
  { key: 'questions', label: 'Preguntas' },
  { key: 'settings', label: 'Configuración' },
] as const;
type Tab = (typeof tabs)[number]['key'];

export default async function AdminProgramPage({ params, searchParams }: PageProps<'/admin/buddies/[id]'>) {
  const { id } = await params;
  const sp = await searchParams;
  const tab: Tab = tabs.some((t) => t.key === sp.tab) ? (sp.tab as Tab) : 'applicants';
  const program = await getProgram(id);
  if (!program) notFound();
  const { applicants, matches } = await getProgramData(program.id);

  return (
    <>
      <PageHeader
        title={program.name}
        back={{ href: '/admin/buddies', label: 'Programas' }}
        actions={
          <>
            {program.active && <Badge tone="green">Activo en /buddies</Badge>}
            {program.registrationOpen ? <Badge>Inscripción abierta</Badge> : <Badge tone="gray">Inscripción cerrada</Badge>}
          </>
        }
      />
      <nav aria-label="Secciones del programa" className="mb-6 flex gap-1 overflow-x-auto border-b">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/buddies/${program.id}?tab=${t.key}`}
            aria-current={tab === t.key ? 'page' : undefined}
            className={cn(
              '-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
              tab === t.key ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-heading'
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === 'applicants' && <ApplicantsTab program={program} applicants={applicants} role={sp.role === 'local' || sp.role === 'exchange' ? sp.role : undefined} />}
      {tab === 'matching' && <MatchingTab program={program} applicants={applicants} matches={matches} />}
      {tab === 'questions' && (
        <Card title="Cuestionario" description="Gustos y personalidad. El peso (0–5) define cuánto cuenta cada pregunta en el matching; las de peso 0 son informativas.">
          <AdminForm action={saveQuestions.bind(null, program.id)}>
            {applicants.length > 0 && (
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Ya hay {applicants.length} postulantes. Si cambiás la clave interna de una pregunta, sus respuestas anteriores dejan de contar.
              </p>
            )}
            <FormBuilder name="questions" initial={program.questions} mode="buddy" />
            <div className="flex justify-end">
              <SaveButton size="lg">Guardar preguntas</SaveButton>
            </div>
          </AdminForm>
        </Card>
      )}
      {tab === 'settings' && <SettingsTab program={program} />}
    </>
  );
}

function ApplicantsTab({ program, applicants, role }: { program: BuddyProgramRow; applicants: BuddyApplicantRow[]; role?: 'local' | 'exchange' }) {
  const visible = role ? applicants.filter((a) => a.role === role) : applicants;
  const counts = { local: applicants.filter((a) => a.role === 'local').length, exchange: applicants.filter((a) => a.role === 'exchange').length };
  const capacity = applicants.filter((a) => a.role === 'local').reduce((sum, a) => sum + a.capacity, 0);
  const filters = [
    { key: undefined, label: `Todos (${applicants.length})` },
    { key: 'exchange', label: `Intercambio (${counts.exchange})` },
    { key: 'local', label: `Buddies ITBA (${counts.local})` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f.label}
              href={`/admin/buddies/${program.id}?tab=applicants${f.key ? `&role=${f.key}` : ''}`}
              className={cn('rounded-full px-3 py-1.5 text-sm font-medium', role === f.key ? 'bg-primary text-white' : 'bg-white ring-1 ring-border hover:bg-sky')}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={`/admin/buddies/${program.id}/csv?type=applicants`}>
            <Download /> Exportar CSV
          </a>
        </Button>
      </div>
      <p className="text-sm text-text-muted">
        Capacidad total de los buddies ITBA: <strong>{capacity}</strong> lugares para <strong>{counts.exchange}</strong> estudiantes de intercambio
        {capacity < counts.exchange && <span className="font-semibold text-amber-700"> — faltan {counts.exchange - capacity} lugares, conviene sumar buddies.</span>}
      </p>
      <Table>
        <thead className="bg-sky/40">
          <tr>
            <th className={th}>Persona</th>
            <th className={th}>Rol</th>
            <th className={th}>Institución / país</th>
            <th className={th}>Idiomas</th>
            <th className={th}>Respuestas</th>
            <th className={th}>
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {visible.length === 0 && <EmptyRow colSpan={6}>Todavía no hay postulantes.</EmptyRow>}
          {visible.map((a) => (
            <tr key={a.id}>
              <td className={td}>
                <p className="font-semibold">{a.name}</p>
                <a href={`mailto:${a.email}`} className="block text-xs text-primary hover:underline">
                  {a.email}
                </a>
                <span className="text-xs text-text-muted">{a.phone}</span>
              </td>
              <td className={td}>
                {a.role === 'local' ? <Badge>ITBA · hasta {a.capacity}</Badge> : <Badge tone="amber">Intercambio</Badge>}
                {a.genderPreference === 'same' && <p className="mt-1 text-xs text-text-muted">Pide mismo género</p>}
              </td>
              <td className={td}>
                {a.institution}
                <p className="text-xs text-text-muted">{a.country}</p>
              </td>
              <td className={`${td} uppercase`}>{a.languages.join(', ')}</td>
              <td className={td}>
                <details className="group max-w-sm">
                  <summary className="cursor-pointer text-xs font-semibold text-primary">Ver respuestas</summary>
                  <dl className="mt-2 space-y-1.5 text-xs">
                    {program.questions.map((q) => (
                      <div key={q.id}>
                        <dt className="font-semibold text-heading">{pick(q.label, 'es')}</dt>
                        <dd className="text-text-muted">{formatAnswer(q, a.answers[q.id]) || '—'}</dd>
                      </div>
                    ))}
                  </dl>
                  <form action={saveApplicantNotes.bind(null, a.id)} className="mt-3 space-y-1.5">
                    <textarea name="notes" defaultValue={a.notes} rows={2} placeholder="Notas internas" aria-label="Notas internas" className={`${adminInput} text-xs`} />
                    <button type="submit" className="text-xs font-semibold text-primary hover:underline">
                      Guardar nota
                    </button>
                  </form>
                </details>
              </td>
              <td className={td}>
                <form action={deleteApplicant.bind(null, a.id)}>
                  <ConfirmButton variant="ghost" size="icon" aria-label={`Eliminar a ${a.name}`} message={`¿Eliminar la postulación de ${a.name}? También se borra su match.`}>
                    <Trash2 />
                  </ConfirmButton>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function scoreTone(score: number) {
  if (score >= 0.7) return 'text-emerald-700';
  if (score >= 0.45) return 'text-amber-700';
  return 'text-red-700';
}

function MatchingTab({
  program,
  applicants,
  matches,
}: {
  program: BuddyProgramRow;
  applicants: BuddyApplicantRow[];
  matches: Awaited<ReturnType<typeof getProgramData>>['matches'];
}) {
  const byId = new Map(applicants.map((a) => [a.id, a]));
  const locals = applicants.filter((a) => a.role === 'local');
  const matchedExchange = new Set(matches.map((m) => m.exchangeId));
  const unmatched = applicants.filter((a) => a.role === 'exchange' && !matchedExchange.has(a.id));
  const load = matches.reduce<Record<string, number>>((acc, m) => ({ ...acc, [m.localId]: (acc[m.localId] ?? 0) + 1 }), {});
  const idleLocals = locals.filter((l) => !load[l.id]);
  const sorted = [...matches].sort((a, b) => (byId.get(a.localId)?.name ?? '').localeCompare(byId.get(b.localId)?.name ?? ''));
  const weighted = matchingQuestions(program);
  const average = matches.length ? matches.reduce((s, m) => s + m.score, 0) / matches.length : 0;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm">
            <p>
              <strong>{matches.length}</strong> matches · <strong>{unmatched.length}</strong> de intercambio sin buddy · <strong>{idleLocals.length}</strong> buddies ITBA sin asignar
              {matches.length > 0 && (
                <>
                  {' '}
                  · compatibilidad promedio <strong>{Math.round(average * 100)}%</strong>
                </>
              )}
            </p>
            <p className="mt-1 text-text-muted">
              Usa {weighted.length} preguntas con peso + idiomas compartidos. Respeta capacidad, preferencias de género y matches bloqueados.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminForm action={generateMatches.bind(null, program.id)} className="space-y-0">
              <SaveButton>
                <Sparkles /> {matches.length ? 'Recalcular' : 'Generar matches'}
              </SaveButton>
            </AdminForm>
            {matches.length > 0 && (
              <>
                <Button asChild variant="outline">
                  <a href={`/admin/buddies/${program.id}/csv?type=matches`}>
                    <Download /> CSV
                  </a>
                </Button>
                <form action={clearUnlockedMatches.bind(null, program.id)}>
                  <ConfirmButton variant="ghost" message="¿Borrar todos los matches no bloqueados?">
                    Limpiar
                  </ConfirmButton>
                </form>
              </>
            )}
          </div>
        </div>
      </Card>

      <Table>
        <thead className="bg-sky/40">
          <tr>
            <th className={th}>Buddy ITBA</th>
            <th className={th}>Intercambio</th>
            <th className={th}>Compatibilidad</th>
            <th className={th}>Por qué</th>
            <th className={th}>
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {sorted.length === 0 && <EmptyRow colSpan={5}>Todavía no hay matches. Tocá “Generar matches”.</EmptyRow>}
          {sorted.map((m) => {
            const local = byId.get(m.localId);
            const exchange = byId.get(m.exchangeId);
            if (!local || !exchange) return null;
            return (
              <tr key={m.id} className={m.locked ? 'bg-sky/20' : undefined}>
                <td className={td}>
                  <p className="font-semibold">{local.name}</p>
                  <p className="text-xs text-text-muted">
                    {load[local.id]}/{local.capacity} asignados
                  </p>
                </td>
                <td className={td}>
                  <p className="font-semibold">{exchange.name}</p>
                  <p className="text-xs text-text-muted">
                    {exchange.country} · {exchange.institution}
                  </p>
                </td>
                <td className={`${td} font-heading text-lg font-bold tabular-nums ${scoreTone(m.score)}`}>{Math.round(m.score * 100)}%</td>
                <td className={`${td} max-w-xs text-xs text-text-muted`}>
                  <ul className="space-y-0.5">
                    {matchReasons(program, local, exchange).map((r) => (
                      <li key={r}>• {r}</li>
                    ))}
                  </ul>
                </td>
                <td className={td}>
                  <div className="flex gap-1">
                    <form action={toggleMatchLock.bind(null, m.id)}>
                      <Button type="submit" variant="ghost" size="icon" aria-label={m.locked ? 'Desbloquear' : 'Bloquear'} title={m.locked ? 'Bloqueado: se mantiene al recalcular' : 'Bloquear para mantenerlo'}>
                        {m.locked ? <Lock className="text-primary" /> : <LockOpen />}
                      </Button>
                    </form>
                    <form action={removeMatch.bind(null, m.id)}>
                      <Button type="submit" variant="ghost" size="icon" aria-label="Quitar match">
                        <X />
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={`Intercambio sin buddy (${unmatched.length})`} description="Asigná a mano: el match queda bloqueado.">
          {unmatched.length === 0 ? (
            <p className="text-sm text-text-muted">Todos tienen buddy 🎉</p>
          ) : (
            <ul className="divide-y">
              {unmatched.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <span className="text-sm font-semibold">
                    {e.name} <span className="font-normal text-text-muted">· {e.country}</span>
                  </span>
                  <form action={assignManually.bind(null, program.id)} className="flex gap-1.5">
                    <input type="hidden" name="exchangeId" value={e.id} />
                    <select name="localId" required aria-label={`Buddy para ${e.name}`} className="rounded-md border bg-white px-2 py-1 text-xs">
                      <option value="">Elegir buddy…</option>
                      {locals.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({load[l.id] ?? 0}/{l.capacity})
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="text-xs font-semibold text-primary hover:underline">
                      Asignar
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title={`Buddies ITBA sin asignar (${idleLocals.length})`}>
          {idleLocals.length === 0 ? (
            <p className="text-sm text-text-muted">Todos tienen al menos un estudiante.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {idleLocals.map((l) => (
                <li key={l.id}>
                  {l.name} <span className="text-text-muted">· hasta {l.capacity}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function SettingsTab({ program }: { program: BuddyProgramRow }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Configuración">
        <AdminForm action={updateProgramSettings.bind(null, program.id)} className="space-y-5">
          <Field label="Nombre" htmlFor="name">
            <input id="name" name="name" defaultValue={program.name} required className={adminInput} />
          </Field>
          <Toggle name="active" label="Programa activo" defaultChecked={program.active} hint="Es el que se muestra en /buddies. Activar este desactiva los demás." />
          <Toggle name="registrationOpen" label="Inscripción abierta" defaultChecked={program.registrationOpen} hint="Solo funciona si el programa está activo." />
          <SaveButton>Guardar</SaveButton>
        </AdminForm>
      </Card>
      <Card title="Zona peligrosa">
        <p className="mb-4 text-sm text-text-muted">Eliminar el programa borra todas las postulaciones y matches. Exportá el CSV antes.</p>
        <form action={deleteProgram.bind(null, program.id)}>
          <ConfirmButton variant="destructive" message={`¿Eliminar "${program.name}" con todas sus postulaciones? No se puede deshacer.`}>
            Eliminar programa
          </ConfirmButton>
        </form>
      </Card>
    </div>
  );
}
