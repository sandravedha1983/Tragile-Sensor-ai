import { getDictionary } from '@/get-dictionary';
import { Locale } from '@/i18n-config';
import { StaffDashboardClient } from '@/components/staff/staff-dashboard-client';

export default async function StaffDashboardPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return <StaffDashboardClient dict={dict} />;
}
