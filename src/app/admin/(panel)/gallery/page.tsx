import Image from 'next/image';
import { asc } from 'drizzle-orm';
import { Trash2 } from 'lucide-react';
import { getDb, schema } from '@/db';
import { AdminForm, ConfirmButton, SaveButton } from '@/components/admin/AdminForm';
import { ImageField } from '@/components/admin/ImageField';
import { adminInput, Card, LocalizedInput, PageHeader } from '@/components/admin/ui';
import { pick } from '@/lib/localized';
import { deleteGalleryPhoto, saveGalleryPhoto } from '../content-actions';

export const metadata = { title: 'Galería' };

export default async function AdminGalleryPage() {
  const photos = await (await getDb()).select().from(schema.galleryPhotos).orderBy(asc(schema.galleryPhotos.sortOrder));
  return (
    <>
      <PageHeader title="Galería" description="Fotos tipo polaroid en la home (se muestran hasta 12, por orden)." />
      <Card title="Agregar foto" className="mb-8">
        <AdminForm action={saveGalleryPhoto.bind(null, null)}>
          <ImageField name="imageUrl" label="Foto" />
          <LocalizedInput name="caption" label="Epígrafe (opcional)" />
          <input type="hidden" name="sortOrder" value={photos.length + 1} />
          <SaveButton>Agregar</SaveButton>
        </AdminForm>
      </Card>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => (
          <li key={photo.id} className="rounded-2xl border bg-white p-3 shadow-xs">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-sky">
              <Image src={photo.imageUrl} alt={pick(photo.caption, 'es')} fill sizes="320px" className="object-cover" />
            </div>
            <AdminForm action={saveGalleryPhoto.bind(null, photo.id)} className="mt-3 space-y-3">
              <input type="hidden" name="imageUrl" value={photo.imageUrl} />
              <input name="caption_es" defaultValue={photo.caption.es} placeholder="Epígrafe (ES)" aria-label="Epígrafe (ES)" className={adminInput} />
              <input name="caption_en" defaultValue={photo.caption.en ?? ''} placeholder="Caption (EN)" aria-label="Epígrafe (EN)" className={adminInput} />
              <div className="flex items-center gap-3">
                <input name="sortOrder" type="number" defaultValue={photo.sortOrder} aria-label="Orden" className={`${adminInput} w-20`} />
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" name="published" defaultChecked={photo.published} className="accent-primary" /> Visible
                </label>
                <SaveButton size="sm" variant="outline" className="ml-auto">
                  Guardar
                </SaveButton>
              </div>
            </AdminForm>
            <form action={deleteGalleryPhoto.bind(null, photo.id)} className="mt-1 text-right">
              <ConfirmButton variant="ghost" size="sm" className="text-red-700" message="¿Quitar esta foto?">
                <Trash2 /> Quitar
              </ConfirmButton>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
