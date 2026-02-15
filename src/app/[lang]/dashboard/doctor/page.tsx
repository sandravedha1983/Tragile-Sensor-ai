import { getDictionary } from '@/get-dictionary';
import { Locale } from '@/i18n-config';
import { DoctorDashboardClient } from '@/components/doctor/doctor-dashboard-client';

export default async function DoctorDashboardPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <DoctorDashboardClient dict={dict} />;
}
