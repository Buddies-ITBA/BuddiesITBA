import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/session';
import { AdminForm, SaveButton } from '@/components/admin/AdminForm';
import { adminInput, Field } from '@/components/admin/ui';
import { login } from './actions';

export const metadata = { title: 'Ingresar' };

export default async function LoginPage() {
  if (await getCurrentAdmin()) redirect('/admin');
  const isLocal = !process.env.DATABASE_URL;

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm">
        <Image src="/assets/img/logo.png" alt="Buddies ITBA" width={640} height={223} sizes="160px" className="mx-auto h-12 w-auto" />
        <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold">Consola de admin</h1>
          <AdminForm action={login} className="mt-5 space-y-4">
            <Field label="Email" htmlFor="email">
              <input id="email" name="email" type="email" required autoComplete="username" className={adminInput} />
            </Field>
            <Field label="Contraseña" htmlFor="password">
              <input id="password" name="password" type="password" required autoComplete="current-password" className={adminInput} />
            </Field>
            <SaveButton className="w-full">Ingresar</SaveButton>
          </AdminForm>
        </div>
        {isLocal && (
          <p className="mt-4 rounded-xl bg-sky p-3 text-center text-xs text-primary-dark">
            Base local de desarrollo: <strong>admin@buddies.local</strong> / <strong>buddies-admin</strong>
          </p>
        )}
      </div>
    </main>
  );
}
