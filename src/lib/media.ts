import 'server-only';
import sharp from 'sharp';
import { getDb, schema } from '@/db';

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_DIMENSION = 1600;

/**
 * Stores an uploaded image in the database, resized to ≤1600px WebP
 * (~100–300 KB). Keeps hosting to a single Postgres — no bucket needed.
 * Returns the public URL (/media/<id>).
 */
export async function storeImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('El archivo no es una imagen');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('La imagen pesa más de 8 MB');

  const { data, info } = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate() // respect EXIF orientation from phones
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });

  const db = await getDb();
  const [row] = await db
    .insert(schema.media)
    .values({ contentType: 'image/webp', data, width: info.width, height: info.height })
    .returning({ id: schema.media.id });
  return `/media/${row.id}`;
}
