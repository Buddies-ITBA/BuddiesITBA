import Link from 'next/link';
import { desc, eq, sql } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { AdminForm, SaveButton } from '@/components/admin/AdminForm';
import { adminInput, Badge, Card, Field, PageHeader } from '@/components/admin/ui';
import { createProgram } from './actions';

export const metadata = { title: 'Programa Buddies' };

export default async function AdminBuddiesPage() {
  const db = await getDb();
  const { buddyPrograms: p, buddyApplicants: a } = schema;
  const programs = await db
    .select({
      id: p.id,
      name: p.name,
      active: p.active,
      registrationOpen: p.registrationOpen,
      locals: sql<number>`count(${a.id}) filter (where ${a.role} = 'local')`.mapWith(Number),
      exchanges: sql<number>`count(${a.id}) filter (where ${a.role} = 'exchange')`.mapWith(Number),
    })
    .from(p)
    .leftJoin(a, eq(a.programId, p.id))
    .groupBy(p.id)
    .orderBy(desc(p.createdAt));

  return (
    <>
      <PageHeader title="Programa Buddies" description="Un programa por cuatrimestre: inscripción, cuestionario de gustos y personalidad, y matching." />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <ul className="space-y-3">
          {programs.length === 0 && <li className="rounded-2xl border border-dashed bg-white p-8 text-center text-sm text-text-muted">Creá el primer programa →</li>}
          {programs.map((program) => (
            <li key={program.id}>
              <Link href={`/admin/buddies/${program.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-5 shadow-xs transition hover:border-primary/40">
                <div>
                  <p className="text-lg font-bold">{program.name}</p>
                  <p className="text-sm text-text-muted">
                    {program.exchanges} de intercambio · {program.locals} buddies ITBA
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {program.active && <Badge tone="green">Activo</Badge>}
                  {program.registrationOpen ? <Badge>Inscripción abierta</Badge> : <Badge tone="gray">Inscripción cerrada</Badge>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <Card title="Nuevo programa">
          <AdminForm action={createProgram} className="space-y-4">
            <Field label="Nombre" htmlFor="program-name">
              <input id="program-name" name="name" required placeholder="2027 · 1er cuatrimestre" className={adminInput} />
            </Field>
            <Field label="Preguntas" htmlFor="copyFrom" hint="Podés editarlas después.">
              <select id="copyFrom" name="copyFrom" className={adminInput} defaultValue="default">
                <option value="default">Cuestionario sugerido</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    Copiar de {program.name}
                  </option>
                ))}
              </select>
            </Field>
            <SaveButton>Crear</SaveButton>
          </AdminForm>
        </Card>
      </div>
    </>
  );
}
