import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { AdminForm, ConfirmButton, SaveButton } from '@/components/admin/AdminForm';
import { ImageField } from '@/components/admin/ImageField';
import { adminInput, Card, Field, LocalizedInput, PageHeader, Toggle } from '@/components/admin/ui';
import { deleteTeamMember, saveTeamMember } from '../../content-actions';

export default async function AdminTeamEditPage({ params }: PageProps<'/admin/team/[id]'>) {
  const { id } = await params;
  let member: schema.TeamMemberRow | undefined;
  if (id !== 'new') {
    [member] = await (await getDb()).select().from(schema.teamMembers).where(eq(schema.teamMembers.id, id)).limit(1);
    if (!member) notFound();
  }

  return (
    <>
      <PageHeader
        title={member?.name ?? 'Nueva persona'}
        back={{ href: '/admin/team', label: 'Equipo' }}
        actions={
          member && (
            <form action={deleteTeamMember.bind(null, member.id)}>
              <ConfirmButton variant="ghost" size="sm" className="text-red-700" message={`¿Eliminar a ${member.name}?`}>
                Eliminar
              </ConfirmButton>
            </form>
          )
        }
      />
      <AdminForm action={saveTeamMember.bind(null, member?.id ?? null)}>
        <Card>
          <div className="space-y-5">
            <Field label="Nombre" htmlFor="name">
              <input id="name" name="name" required defaultValue={member?.name} className={adminInput} />
            </Field>
            <LocalizedInput name="role" label="Rol" value={member?.role} required />
            <LocalizedInput name="career" label="Carrera" value={member?.career} />
            <LocalizedInput name="bio" label="Bio corta" value={member?.bio} multiline rows={2} />
            <ImageField name="imageUrl" label="Foto" defaultValue={member?.imageUrl} />
            <Field label="LinkedIn" htmlFor="linkedinUrl">
              <input id="linkedinUrl" name="linkedinUrl" type="url" defaultValue={member?.linkedinUrl ?? ''} className={adminInput} />
            </Field>
            <div className="flex flex-wrap items-end gap-6">
              <Field label="Orden" htmlFor="sortOrder">
                <input id="sortOrder" name="sortOrder" type="number" defaultValue={member?.sortOrder ?? 0} className={`${adminInput} w-24`} />
              </Field>
              <Toggle name="active" label="Visible en el sitio" defaultChecked={member?.active ?? true} />
            </div>
          </div>
        </Card>
        <div className="flex justify-end">
          <SaveButton size="lg">{member ? 'Guardar' : 'Agregar'}</SaveButton>
        </div>
      </AdminForm>
    </>
  );
}
