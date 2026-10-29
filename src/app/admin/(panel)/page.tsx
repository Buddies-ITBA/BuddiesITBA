import Link from 'next/link';
import { asc, count, eq, gte, sql } from 'drizzle-orm';
import { CalendarDays, HeartHandshake, Plus, UserPlus, Users } from 'lucide-react';
import { getDb, schema } from '@/db';
import { Button } from '@/components/ui/button';
import { Card, PageHeader } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth/session';
import { formatEventDate } from '@/lib/dates';
import { pick } from '@/lib/localized';

export const metadata = { title: 'Inicio' };

export default async function AdminHome() {
  const admin = await requireAdmin();
  const db = await getDb();
  const { events, eventRegistrations: r, buddyPrograms, buddyApplicants, buddyMatches } = schema;

  const [upcoming, [{ value: newRegistrations }], [program]] = await Promise.all([
    db
      .select({
        id: events.id,
        title: events.title,
        startsAt: events.startsAt,
        capacity: events.capacity,
        registrationType: events.registrationType,
        confirmed: sql<number>`count(${r.id}) filter (where ${r.status} = 'confirmed')`.mapWith(Number),
      })
      .from(events)
      .leftJoin(r, eq(r.eventId, events.id))
      .where(gte(events.startsAt, sql`now()`))
      .groupBy(events.id)
      .orderBy(asc(events.startsAt))
      .limit(5),
    db.select({ value: count() }).from(r).where(gte(r.createdAt, sql`now() - interval '7 days'`)),
    db.select().from(buddyPrograms).where(eq(buddyPrograms.active, true)).limit(1),
  ]);

  let buddyStats = { locals: 0, exchanges: 0, matched: 0 };
  if (program) {
    const [roles, [{ value: matched }]] = await Promise.all([
      db.select({ role: buddyApplicants.role, value: count() }).from(buddyApplicants).where(eq(buddyApplicants.programId, program.id)).groupBy(buddyApplicants.role),
      db.select({ value: count() }).from(buddyMatches).where(eq(buddyMatches.programId, program.id)),
    ]);
    buddyStats = {
      locals: roles.find((x) => x.role === 'local')?.value ?? 0,
      exchanges: roles.find((x) => x.role === 'exchange')?.value ?? 0,
      matched,
    };
  }

  const stats = [
    { label: 'Próximos eventos', value: upcoming.length, Icon: CalendarDays },
    { label: 'Inscripciones (7 días)', value: newRegistrations, Icon: UserPlus },
    { label: 'Buddies ITBA anotados', value: buddyStats.locals, Icon: Users },
    { label: 'Intercambio sin buddy', value: Math.max(buddyStats.exchanges - buddyStats.matched, 0), Icon: HeartHandshake },
  ];

  return (
    <>
      <PageHeader
        title={`Hola, ${admin.name.split(' ')[0]}`}
        description="Resumen de lo que está pasando."
        actions={
          <Button asChild>
            <Link href="/admin/events/new">
              <Plus /> Nuevo evento
            </Link>
          </Button>
        }
      />
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, Icon }) => (
          <li key={label} className="rounded-2xl border bg-white p-5 shadow-xs">
            <Icon className="size-5 text-primary" aria-hidden />
            <p className="mt-3 font-heading text-3xl font-extrabold tabular-nums">{value}</p>
            <p className="text-sm text-text-muted">{label}</p>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card title="Próximos eventos">
          {upcoming.length === 0 ? (
            <p className="text-sm text-text-muted">No hay eventos próximos.</p>
          ) : (
            <ul className="divide-y">
              {upcoming.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <Link href={`/admin/events/${e.id}`} className="font-semibold text-primary hover:underline">
                      {pick(e.title, 'es')}
                    </Link>
                    <p className="text-xs text-text-muted">{formatEventDate(e.startsAt, 'es', 'weekdayLong')}</p>
                  </div>
                  {e.registrationType === 'form' && (
                    <Link href={`/admin/events/${e.id}/registrations`} className="text-sm font-semibold tabular-nums">
                      {e.confirmed}
                      {e.capacity ? `/${e.capacity}` : ''} anotados
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Programa Buddies" description={program ? program.name : 'No hay un programa activo.'}>
          {program ? (
            <div className="space-y-4">
              <p className="text-sm">
                <strong>{buddyStats.exchanges}</strong> de intercambio · <strong>{buddyStats.locals}</strong> buddies ITBA · <strong>{buddyStats.matched}</strong> matches
              </p>
              <p className="text-sm text-text-muted">Inscripción {program.registrationOpen ? 'abierta' : 'cerrada'}.</p>
              <Button asChild variant="outline">
                <Link href={`/admin/buddies/${program.id}?tab=matching`}>Ir al matching</Link>
              </Button>
            </div>
          ) : (
            <Button asChild variant="outline">
              <Link href="/admin/buddies">Crear programa</Link>
            </Button>
          )}
        </Card>
      </div>
    </>
  );
}
