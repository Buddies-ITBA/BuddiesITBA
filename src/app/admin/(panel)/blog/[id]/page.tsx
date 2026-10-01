import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { AdminForm, ConfirmButton, SaveButton } from '@/components/admin/AdminForm';
import { ImageField } from '@/components/admin/ImageField';
import { adminInput, Card, Field, LocalizedInput, PageHeader, Toggle } from '@/components/admin/ui';
import { toDateTimeInput } from '@/lib/dates';
import { pick } from '@/lib/localized';
import { deletePost, savePost } from '../../content-actions';

export default async function AdminPostEditPage({ params }: PageProps<'/admin/blog/[id]'>) {
  const { id } = await params;
  let post: schema.PostRow | undefined;
  if (id !== 'new') {
    [post] = await (await getDb()).select().from(schema.posts).where(eq(schema.posts.id, id)).limit(1);
    if (!post) notFound();
  }

  return (
    <>
      <PageHeader
        title={post ? pick(post.title, 'es') : 'Nuevo post'}
        back={{ href: '/admin/blog', label: 'Blog' }}
        actions={
          post && (
            <form action={deletePost.bind(null, post.id)}>
              <ConfirmButton variant="ghost" size="sm" className="text-red-700" message="¿Eliminar este post?">
                Eliminar
              </ConfirmButton>
            </form>
          )
        }
      />
      <AdminForm action={savePost.bind(null, post?.id ?? null)}>
        <Card>
          <div className="space-y-5">
            <LocalizedInput name="title" label="Título" value={post?.title} required />
            <LocalizedInput name="excerpt" label="Resumen" value={post?.excerpt} multiline rows={2} />
            <LocalizedInput name="body" label="Contenido" value={post?.body} multiline rows={14} hint="Markdown: ## títulos, **negrita**, - listas, [links](https://…), ![imagen](url)." />
            <LocalizedInput name="category" label="Categoría" value={post?.category} />
            <ImageField name="coverUrl" label="Imagen de portada" defaultValue={post?.coverUrl} />
            <div className="grid gap-5 md:grid-cols-3">
              <Field label="URL" htmlFor="slug" hint="Vacío = se genera del título.">
                <input id="slug" name="slug" defaultValue={post?.slug} className={adminInput} />
              </Field>
              <Field label="Autor/a" htmlFor="authorName">
                <input id="authorName" name="authorName" defaultValue={post?.authorName ?? 'Buddies ITBA'} className={adminInput} />
              </Field>
              <Field label="Fecha de publicación" htmlFor="publishedAt">
                <input id="publishedAt" name="publishedAt" type="date" defaultValue={toDateTimeInput(post?.publishedAt ?? new Date()).slice(0, 10)} className={adminInput} />
              </Field>
            </div>
            <Toggle name="published" label="Publicado" defaultChecked={post?.published ?? false} />
          </div>
        </Card>
        <div className="flex justify-end">
          <SaveButton size="lg">{post ? 'Guardar' : 'Crear post'}</SaveButton>
        </div>
      </AdminForm>
    </>
  );
}
