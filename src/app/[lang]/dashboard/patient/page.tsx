import { getDictionary } from '@/get-dictionary';
import { Locale } from '@/i18n-config';
import { PatientDashboardClient } from '@/components/patient/patient-dashboard-client';

export default async function PatientDashboardPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <PatientDashboardClient dict={dict} />;
}
