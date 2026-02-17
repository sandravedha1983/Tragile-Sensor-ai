import { getDictionary } from '@/get-dictionary';
import { Locale } from '@/i18n-config';
import { Loader2 } from 'lucide-react';

export default async function DashboardPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-muted-foreground font-medium">Preparing your workspace...</p>
    </div>
  );
}
