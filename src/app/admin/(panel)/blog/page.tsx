import Link from 'next/link';
import { desc } from 'drizzle-orm';
import { Plus } from 'lucide-react';
import { getDb, schema } from '@/db';
import { Button } from '@/components/ui/button';
import { Badge, EmptyRow, PageHeader, Table, td, th } from '@/components/admin/ui';
import { formatEventDate } from '@/lib/dates';
import { pick } from '@/lib/localized';

export const metadata = { title: 'Blog' };

export default async function AdminBlogPage() {
  const rows = await (await getDb()).select().from(schema.posts).orderBy(desc(schema.posts.publishedAt));
  return (
    <>
      <PageHeader
        title="Blog"
        actions={
          <Button asChild>
            <Link href="/admin/blog/new">
              <Plus /> Nuevo post
            </Link>
          </Button>
        }
      />
      <Table>
        <thead className="bg-sky/40">
          <tr>
            <th className={th}>Fecha</th>
            <th className={th}>Título</th>
            <th className={th}>Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.length === 0 && <EmptyRow colSpan={3}>Todavía no hay posts.</EmptyRow>}
          {rows.map((post) => (
            <tr key={post.id}>
              <td className={`${td} whitespace-nowrap`}>{formatEventDate(post.publishedAt, 'es', 'long')}</td>
              <td className={td}>
                <Link href={`/admin/blog/${post.id}`} className="font-semibold text-primary hover:underline">
                  {pick(post.title, 'es')}
                </Link>
              </td>
              <td className={td}>{post.published ? <Badge tone="green">Publicado</Badge> : <Badge tone="gray">Borrador</Badge>}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
