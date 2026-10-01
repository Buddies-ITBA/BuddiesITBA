import { timingSafeEqual } from 'node:crypto';
import { sendDueReminders } from '@/lib/reminders';

/**
 * Daily job (vercel.json cron, or .github/workflows/reminders.yml elsewhere).
 * Vercel sends `Authorization: Bearer $CRON_SECRET` automatically.
 * Without CRON_SECRET configured the endpoint is disabled.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;
  const authorized =
    !!secret && given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  if (!authorized) return new Response('Unauthorized', { status: 401 });

  const results = await sendDueReminders();
  return Response.json({ ok: true, events: results });
}
