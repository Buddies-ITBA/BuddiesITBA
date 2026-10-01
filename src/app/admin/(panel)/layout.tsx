import { requireAdmin } from '@/lib/auth/session';
import { AdminShell } from '@/components/admin/AdminShell';
import { logout } from '../login/actions';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <AdminShell admin={admin} logout={logout}>
      {children}
    </AdminShell>
  );
}
