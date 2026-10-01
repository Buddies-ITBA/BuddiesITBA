import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { AdminForm, ConfirmButton, SaveButton } from '@/components/admin/AdminForm';
import { adminInput, Card, Field, LocalizedInput, PageHeader, Toggle } from '@/components/admin/ui';
import { pick } from '@/lib/localized';
import { deleteFaq, saveFaq } from '../../content-actions';

export default async function AdminFaqEditPage({ params }: PageProps<'/admin/faq/[id]'>) {
  const { id } = await params;
  let faq: schema.FaqRow | undefined;
  if (id !== 'new') {
    [faq] = await (await getDb()).select().from(schema.faqs).where(eq(schema.faqs.id, id)).limit(1);
    if (!faq) notFound();
  }

  return (
    <>
      <PageHeader
        title={faq ? pick(faq.question, 'es') : 'Nueva pregunta'}
        back={{ href: '/admin/faq', label: 'FAQ' }}
        actions={
          faq && (
            <form action={deleteFaq.bind(null, faq.id)}>
              <ConfirmButton variant="ghost" size="sm" className="text-red-700" message="¿Eliminar esta pregunta?">
                Eliminar
              </ConfirmButton>
            </form>
          )
        }
      />
      <AdminForm action={saveFaq.bind(null, faq?.id ?? null)}>
        <Card>
          <div className="space-y-5">
            <LocalizedInput name="question" label="Pregunta" value={faq?.question} required />
            <LocalizedInput name="answer" label="Respuesta" value={faq?.answer} multiline rows={6} required hint="Admite Markdown." />
            <LocalizedInput name="category" label="Categoría" value={faq?.category} hint="Ej: Llegada, Vida en Buenos Aires, Facultad." />
            <div className="flex flex-wrap items-end gap-6">
              <Field label="Orden" htmlFor="sortOrder">
                <input id="sortOrder" name="sortOrder" type="number" defaultValue={faq?.sortOrder ?? 0} className={`${adminInput} w-24`} />
              </Field>
              <Toggle name="published" label="Publicada" defaultChecked={faq?.published ?? true} />
            </div>
          </div>
        </Card>
        <div className="flex justify-end">
          <SaveButton size="lg">{faq ? 'Guardar' : 'Crear pregunta'}</SaveButton>
        </div>
      </AdminForm>
    </>
  );
}
