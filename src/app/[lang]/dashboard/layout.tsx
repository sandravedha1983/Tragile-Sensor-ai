import { getDictionary } from '@/get-dictionary';
import { Locale } from '@/i18n-config';
import { DashboardLayoutClient } from '@/components/dashboard-layout-client';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <DashboardLayoutClient lang={lang} dict={dict}>
      {children}
    </DashboardLayoutClient>
  );
}
