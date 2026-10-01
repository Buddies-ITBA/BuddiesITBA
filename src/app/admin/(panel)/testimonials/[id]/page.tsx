import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { AdminForm, ConfirmButton, SaveButton } from '@/components/admin/AdminForm';
import { ImageField } from '@/components/admin/ImageField';
import { adminInput, Card, Field, LocalizedInput, PageHeader, Toggle } from '@/components/admin/ui';
import { countryFlag, countryOptions } from '@/lib/countries';
import { deleteTestimonial, saveTestimonial } from '../../content-actions';

export default async function AdminTestimonialEditPage({ params }: PageProps<'/admin/testimonials/[id]'>) {
  const { id } = await params;
  let item: schema.TestimonialRow | undefined;
  if (id !== 'new') {
    [item] = await (await getDb()).select().from(schema.testimonials).where(eq(schema.testimonials.id, id)).limit(1);
    if (!item) notFound();
  }

  return (
    <>
      <PageHeader
        title={item?.name ?? 'Nuevo testimonio'}
        back={{ href: '/admin/testimonials', label: 'Testimonios' }}
        actions={
          item && (
            <form action={deleteTestimonial.bind(null, item.id)}>
              <ConfirmButton variant="ghost" size="sm" className="text-red-700" message="¿Eliminar este testimonio?">
                Eliminar
              </ConfirmButton>
            </form>
          )
        }
      />
      <AdminForm action={saveTestimonial.bind(null, item?.id ?? null)}>
        <Card>
          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nombre" htmlFor="name">
                <input id="name" name="name" required defaultValue={item?.name} className={adminInput} />
              </Field>
              <Field label="País" htmlFor="countryCode">
                <select id="countryCode" name="countryCode" defaultValue={item?.countryCode ?? ''} className={adminInput}>
                  <option value="">—</option>
                  {countryOptions('es').map((c) => (
                    <option key={c.value} value={c.value}>
                      {countryFlag(c.value)} {c.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <LocalizedInput name="quote" label="Cita" value={item?.quote} multiline rows={4} required hint="Corta y concreta: 1–3 oraciones." />
            <LocalizedInput name="subtitle" label="Detalle" value={item?.subtitle} hint="Ej: Intercambio 2025 · TU München" />
            <ImageField name="imageUrl" label="Foto" defaultValue={item?.imageUrl} />
            <div className="flex flex-wrap items-end gap-6">
              <Field label="Orden" htmlFor="sortOrder">
                <input id="sortOrder" name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} className={`${adminInput} w-24`} />
              </Field>
              <Toggle name="published" label="Publicado" defaultChecked={item?.published ?? true} />
            </div>
          </div>
        </Card>
        <div className="flex justify-end">
          <SaveButton size="lg">{item ? 'Guardar' : 'Crear testimonio'}</SaveButton>
        </div>
      </AdminForm>
    </>
  );
}
