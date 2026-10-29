import { desc } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { Badge, Card, EmptyRow, PageHeader, Table, td, th } from '@/components/admin/ui';
import { emailEnabled } from '@/lib/email/send';

export const metadata = { title: 'Emails' };

const kindLabels: Record<string, string> = {
  'registration.confirmed': 'Inscripción confirmada',
  'registration.waitlist': 'Lista de espera',
  'registration.promoted': 'Pasó de la lista de espera',
  'buddies.received': 'Postulación recibida',
  'buddies.intro': 'Presentación de buddies',
};

const tones = { sent: 'green', failed: 'red', logged: 'gray' } as const;
const statusLabels = { sent: 'Enviado', failed: 'Falló', logged: 'No enviado (sin configurar)' } as const;

export default async function EmailsPage() {
  const rows = await (await getDb()).select().from(schema.emailLog).orderBy(desc(schema.emailLog.createdAt)).limit(200);
  const fmt = new Intl.DateTimeFormat('es', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Argentina/Buenos_Aires' });

  return (
    <>
      <PageHeader title="Emails" description="Los últimos 200 emails que generó el sitio." />
      {!emailEnabled() && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900">
            <strong>El envío de emails no está configurado.</strong> Se registran acá pero no se mandan. Para activarlo, creá una cuenta gratis en Resend,
            verificá el dominio y cargá <code>RESEND_API_KEY</code> y <code>EMAIL_FROM</code> (ej. <code>Buddies ITBA &lt;hola@tu-dominio&gt;</code>) en el hosting.
          </p>
        </Card>
      )}
      <Table>
        <thead className="bg-sky/40">
          <tr>
            <th className={th}>Fecha</th>
            <th className={th}>Para</th>
            <th className={th}>Tipo</th>
            <th className={th}>Asunto</th>
            <th className={th}>Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.length === 0 && <EmptyRow colSpan={5}>Todavía no se generó ningún email.</EmptyRow>}
          {rows.map((r) => (
            <tr key={r.id}>
              <td className={`${td} whitespace-nowrap text-text-muted`}>{fmt.format(r.createdAt)}</td>
              <td className={td}>{r.to}</td>
              <td className={td}>{kindLabels[r.kind] ?? r.kind}</td>
              <td className={td}>{r.subject}</td>
              <td className={td}>
                <Badge tone={tones[r.status]}>{statusLabels[r.status]}</Badge>
                {r.error && <p className="mt-1 max-w-xs text-xs text-red-700">{r.error}</p>}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
