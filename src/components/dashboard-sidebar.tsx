'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LineChart, Hospital, Users } from 'lucide-react';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { Locale } from '@/i18n-config';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useUser } from '@/firebase';

const navItems = (lang: Locale, dict: any, role?: string) => {
  const dashboardLabel = role ? `${role} Dashboard` : (dict.dashboard.staff?.title || 'Dashboard');
  const dashboardHref = role === 'TriageStaff' ? `/${lang}/dashboard/staff` : `/${lang}/dashboard`;
  return [
    { href: dashboardHref, icon: Home, label: dashboardLabel },
    { href: `/${lang}/dashboard/analytics`, icon: LineChart, label: 'Analytics' },
    { href: `/${lang}/dashboard/resources`, icon: Hospital, label: 'Resources' },
    { href: `/${lang}/dashboard/users`, icon: Users, label: 'Users' },
  ];
};

export function DashboardSidebar({ lang, dict }: { lang: Locale; dict: any }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { role } = useUserProfile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = navItems(lang, dict, role).filter(item => {
    if (role === 'Doctor' && item.label === 'Users') return false;
    return true;
  });

  if (!mounted) return (
    <div className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Logo lang={lang} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Logo lang={lang} />
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted',
                  {
                    'bg-muted text-primary': pathname === item.href,
                  }
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
