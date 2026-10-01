import 'server-only';
import { getDb, schema } from '@/db';

export type Email = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** For the admin log: "registration.confirmed", "buddies.intro"… */
  kind: string;
  replyTo?: string;
};

/**
 * Sends through Resend's HTTP API when RESEND_API_KEY and EMAIL_FROM are set;
 * otherwise prints to the console (local dev). Never throws: a failed email
 * must not undo a registration. Every attempt is recorded in email_log.
 */
export async function sendEmail(email: Email): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  let status: 'sent' | 'failed' | 'logged' = 'logged';
  let error: string | null = null;

  if (apiKey && from) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to: [email.to],
          subject: email.subject,
          html: email.html,
          text: email.text,
          ...(email.replyTo && { reply_to: email.replyTo }),
        }),
        signal: AbortSignal.timeout(10_000),
      });
      status = response.ok ? 'sent' : 'failed';
      if (!response.ok) error = `${response.status} ${(await response.text()).slice(0, 300)}`;
    } catch (e) {
      status = 'failed';
      error = e instanceof Error ? e.message : String(e);
    }
  } else {
    console.info(`[email] (not sent: RESEND_API_KEY/EMAIL_FROM unset) → ${email.to} · ${email.subject}\n${email.text}\n`);
  }

  try {
    const db = await getDb();
    await db.insert(schema.emailLog).values({ to: email.to, subject: email.subject, kind: email.kind, status, error });
  } catch (e) {
    console.error('[email] could not write email_log', e);
  }
  if (status === 'failed') console.error(`[email] failed → ${email.to}: ${error}`);
  return status !== 'failed';
}

export const emailEnabled = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
