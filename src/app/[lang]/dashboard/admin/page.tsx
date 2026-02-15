import { getDictionary } from '@/get-dictionary';
import { Locale } from '@/i18n-config';
import { AdminDashboardClient } from '@/components/admin/admin-dashboard-client';

export default async function AdminDashboardPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <AdminDashboardClient dict={dict} />;
}
