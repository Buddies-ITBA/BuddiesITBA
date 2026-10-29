'use server';

import { requireAdmin } from '@/lib/auth/session';
import { storeImage } from '@/lib/media';

export async function uploadImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: 'Elegí una imagen' };
  try {
    return { url: await storeImage(file) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No se pudo subir la imagen' };
  }
}
