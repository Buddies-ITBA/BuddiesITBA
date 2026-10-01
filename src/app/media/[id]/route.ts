import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Uploaded images never change (a new upload gets a new id), so cache forever.
export async function GET(_request: Request, { params }: RouteContext<'/media/[id]'>) {
  const { id } = await params;
  if (!UUID.test(id)) return new Response('Not found', { status: 404 });

  const db = await getDb();
  const [row] = await db
    .select({ data: schema.media.data, contentType: schema.media.contentType })
    .from(schema.media)
    .where(eq(schema.media.id, id))
    .limit(1);
  if (!row) return new Response('Not found', { status: 404 });

  return new Response(new Uint8Array(row.data), {
    headers: {
      'Content-Type': row.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
