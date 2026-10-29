import { asc } from 'drizzle-orm';
import { Trash2 } from 'lucide-react';
import { getDb, schema } from '@/db';
import { requireAdmin } from '@/lib/auth/session';
import { AdminForm, ConfirmButton, SaveButton } from '@/components/admin/AdminForm';
import { adminInput, Card, Field, PageHeader } from '@/components/admin/ui';
import { changeOwnPassword, createAdmin, deleteAdmin } from './actions';

export const metadata = { title: 'Administradores' };

export default async function AdminsPage() {
  const me = await requireAdmin();
  const admins = await (await getDb())
    .select({ id: schema.admins.id, name: schema.admins.name, email: schema.admins.email })
    .from(schema.admins)
    .orderBy(asc(schema.admins.createdAt));

  return (
    <>
      <PageHeader title="Administradores" description="Personas con acceso a esta consola." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Con acceso">
          <ul className="divide-y">
            {admins.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold">
                    {a.name} {a.id === me.id && <span className="text-xs font-normal text-text-muted">(vos)</span>}
                  </p>
                  <p className="text-sm text-text-muted">{a.email}</p>
                </div>
                {a.id !== me.id && (
                  <form action={deleteAdmin.bind(null, a.id)}>
                    <ConfirmButton variant="ghost" size="icon" aria-label={`Quitar acceso a ${a.name}`} message={`¿Quitarle el acceso a ${a.name}?`}>
                      <Trash2 />
                    </ConfirmButton>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </Card>
        <div className="space-y-6">
          <Card title="Agregar admin" description="Compartile la contraseña por un canal privado y pedile que la cambie.">
            <AdminForm action={createAdmin} className="space-y-4">
              <Field label="Nombre" htmlFor="new-name">
                <input id="new-name" name="name" required className={adminInput} />
              </Field>
              <Field label="Email" htmlFor="new-email">
                <input id="new-email" name="email" type="email" required className={adminInput} />
              </Field>
              <Field label="Contraseña inicial" htmlFor="new-password" hint="Mínimo 10 caracteres.">
                <input id="new-password" name="password" type="text" minLength={10} required autoComplete="off" className={adminInput} />
              </Field>
              <SaveButton>Agregar</SaveButton>
            </AdminForm>
          </Card>
          <Card title="Cambiar mi contraseña">
            <AdminForm action={changeOwnPassword} className="space-y-4">
              <Field label="Nueva contraseña" htmlFor="my-password">
                <input id="my-password" name="password" type="password" minLength={10} required autoComplete="new-password" className={adminInput} />
              </Field>
              <SaveButton variant="outline">Actualizar</SaveButton>
            </AdminForm>
          </Card>
        </div>
      </div>
    </>
  );
}
