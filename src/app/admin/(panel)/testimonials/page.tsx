import Image from 'next/image';
import Link from 'next/link';
import { asc } from 'drizzle-orm';
import { Plus } from 'lucide-react';
import { getDb, schema } from '@/db';
import { Button } from '@/components/ui/button';
import { Badge, PageHeader } from '@/components/admin/ui';
import { countryFlag } from '@/lib/countries';
import { pick } from '@/lib/localized';

export const metadata = { title: 'Testimonios' };

export default async function AdminTestimonialsPage() {
  const rows = await (await getDb()).select().from(schema.testimonials).orderBy(asc(schema.testimonials.sortOrder));
  return (
    <>
      <PageHeader
        title="Testimonios"
        description="Citas de estudiantes y buddies. Se muestran en la home y en /buddies."
        actions={
          <Button asChild>
            <Link href="/admin/testimonials/new">
              <Plus /> Nuevo testimonio
            </Link>
          </Button>
        }
      />
      {rows.length === 0 && <p className="rounded-2xl border border-dashed bg-white p-8 text-center text-sm text-text-muted">Todavía no hay testimonios.</p>}
      <ul className="grid gap-4 md:grid-cols-2">
        {rows.map((t) => (
          <li key={t.id}>
            <Link href={`/admin/testimonials/${t.id}`} className="flex gap-4 rounded-2xl border bg-white p-4 shadow-xs transition hover:border-primary/40">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-sky">
                {t.imageUrl && <Image src={t.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div className="min-w-0">
                <p className="font-semibold">
                  {t.name} {t.countryCode && countryFlag(t.countryCode)}
                </p>
                <p className="line-clamp-2 text-sm italic text-text-muted">“{pick(t.quote, 'es')}”</p>
                {!t.published && <Badge tone="gray">Oculto</Badge>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
