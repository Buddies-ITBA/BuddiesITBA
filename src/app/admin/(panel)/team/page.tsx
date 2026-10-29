import Image from 'next/image';
import Link from 'next/link';
import { asc } from 'drizzle-orm';
import { Plus } from 'lucide-react';
import { getDb, schema } from '@/db';
import { Button } from '@/components/ui/button';
import { Badge, PageHeader } from '@/components/admin/ui';
import { pick } from '@/lib/localized';

export const metadata = { title: 'Equipo' };

export default async function AdminTeamPage() {
  const rows = await (await getDb()).select().from(schema.teamMembers).orderBy(asc(schema.teamMembers.sortOrder));
  return (
    <>
      <PageHeader
        title="Equipo"
        description="Se muestra en /about."
        actions={
          <Button asChild>
            <Link href="/admin/team/new">
              <Plus /> Agregar persona
            </Link>
          </Button>
        }
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((m) => (
          <li key={m.id}>
            <Link href={`/admin/team/${m.id}`} className="flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-xs transition hover:border-primary/40">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-sky">
                {m.imageUrl && <Image src={m.imageUrl} alt="" fill sizes="56px" className="object-cover" />}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{m.name}</p>
                <p className="truncate text-sm text-text-muted">{pick(m.role, 'es')}</p>
                {!m.active && <Badge tone="gray">Oculto</Badge>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
