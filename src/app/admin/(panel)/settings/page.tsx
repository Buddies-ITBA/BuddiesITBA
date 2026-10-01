import { AdminForm, SaveButton } from '@/components/admin/AdminForm';
import { adminInput, Card, Field, PageHeader } from '@/components/admin/ui';
import { getSiteSettings } from '@/lib/data/public';
import { saveSiteSettings } from '../content-actions';

export const metadata = { title: 'Sitio' };

const ROWS = 6;

export default async function AdminSettingsPage() {
  const { stats, whatsappUrl } = await getSiteSettings();
  return (
    <>
      <PageHeader title="Configuración del sitio" description="Números de la home y links de la comunidad." />
      <AdminForm action={saveSiteSettings}>
        <Card title="Números destacados" description="La franja azul de la home y de /about. Dejá vacía una fila para no mostrarla.">
          <div className="space-y-3">
            <div className="hidden grid-cols-[110px_1fr_1fr] gap-3 text-xs font-semibold uppercase tracking-wide text-text-muted md:grid">
              <span>Número</span>
              <span>Texto (ES)</span>
              <span>Texto (EN)</span>
            </div>
            {Array.from({ length: ROWS }, (_, i) => (
              <div key={i} className="grid gap-3 md:grid-cols-[110px_1fr_1fr]">
                <input name={`stat_${i}_value`} type="number" min={0} defaultValue={stats[i]?.value ?? ''} aria-label={`Número ${i + 1}`} className={adminInput} />
                <input name={`stat_${i}_label_es`} defaultValue={stats[i]?.label.es ?? ''} aria-label={`Texto ${i + 1} (ES)`} className={adminInput} />
                <input name={`stat_${i}_label_en`} defaultValue={stats[i]?.label.en ?? ''} aria-label={`Texto ${i + 1} (EN)`} className={adminInput} />
              </div>
            ))}
          </div>
        </Card>
        <Card title="Comunidad">
          <Field label="Link de invitación a la comunidad de WhatsApp" htmlFor="whatsappUrl" hint="Se muestra en la home y en los eventos que se inscriben por WhatsApp. Vacío = no se muestra.">
            <input id="whatsappUrl" name="whatsappUrl" type="url" defaultValue={whatsappUrl ?? ''} placeholder="https://chat.whatsapp.com/…" className={adminInput} />
          </Field>
        </Card>
        <div className="flex justify-end">
          <SaveButton size="lg">Guardar</SaveButton>
        </div>
      </AdminForm>
    </>
  );
}
