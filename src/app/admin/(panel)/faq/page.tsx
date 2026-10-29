import Link from 'next/link';
import { asc } from 'drizzle-orm';
import { Plus } from 'lucide-react';
import { getDb, schema } from '@/db';
import { Button } from '@/components/ui/button';
import { Badge, EmptyRow, PageHeader, Table, td, th } from '@/components/admin/ui';
import { pick } from '@/lib/localized';

export const metadata = { title: 'FAQ' };

export default async function AdminFaqPage() {
  const rows = await (await getDb()).select().from(schema.faqs).orderBy(asc(schema.faqs.sortOrder));
  return (
    <>
      <PageHeader
        title="Preguntas frecuentes"
        description="Se agrupan por categoría y se ordenan por número de orden."
        actions={
          <Button asChild>
            <Link href="/admin/faq/new">
              <Plus /> Nueva pregunta
            </Link>
          </Button>
        }
      />
      <Table>
        <thead className="bg-sky/40">
          <tr>
            <th className={th}>Orden</th>
            <th className={th}>Pregunta</th>
            <th className={th}>Categoría</th>
            <th className={th}>Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.length === 0 && <EmptyRow colSpan={4}>No hay preguntas cargadas.</EmptyRow>}
          {rows.map((faq) => (
            <tr key={faq.id}>
              <td className={`${td} w-16 text-text-muted`}>{faq.sortOrder}</td>
              <td className={td}>
                <Link href={`/admin/faq/${faq.id}`} className="font-semibold text-primary hover:underline">
                  {pick(faq.question, 'es')}
                </Link>
                {!faq.question.en && <span className="ml-2 text-xs text-amber-700">falta inglés</span>}
              </td>
              <td className={td}>{pick(faq.category, 'es') || '—'}</td>
              <td className={td}>{faq.published ? <Badge tone="green">Publicada</Badge> : <Badge tone="gray">Oculta</Badge>}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
