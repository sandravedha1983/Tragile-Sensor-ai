'use client';

import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Locale } from '@/i18n-config';

export function DashboardLayoutClient({
    children,
    lang,
    dict
}: {
    children: React.ReactNode;
    lang: Locale;
    dict: any;
}) {
    const { user, userProfile, isLoading } = useUserProfile();
    const router = useRouter();
    const pathname = usePathname();
    const [isRouting, setIsRouting] = useState(true);

    useEffect(() => {
        if (isLoading) {
            return; // Wait until user and profile are loaded
        }

        const currentLang = pathname.split('/')[1] as Locale;

        if (!user) {
            router.replace(`/${currentLang}/login`);
            return;
        }

        // Anonymous users should not be in the dashboard. Redirect to the dedicated emergency page.
        if (user.isAnonymous) {
            router.replace(`/${currentLang}/emergency`);
            return;
        }

        let targetPath: string | null = null;

        if (userProfile) {
            switch (userProfile.role) {
                case 'Admin':
                    targetPath = `/${currentLang}/dashboard/admin`;
                    break;
                case 'Doctor':
                    targetPath = `/${currentLang}/dashboard/doctor`;
                    break;
                case 'TriageStaff':
                    targetPath = `/${currentLang}/dashboard/staff`;
                    break;
                case 'Patient':
                    targetPath = `/${currentLang}/dashboard/patient`;
                    break;
                default:
                    router.replace(`/${currentLang}/login`);
                    return;
            }
        } else if (!user.isAnonymous && !userProfile) {
            // Registered user but profile not found yet, still in a loading state.
            return;
        }

        // REDIRECTION LOGIC IMPROVED: 
        // Only redirect if at the base dashboard path.
        // This prevents the "blinking" loop and allows access to /resources, /settings, etc.
        const isAtDashboardRoot = pathname === `/${currentLang}/dashboard` || pathname === `/${currentLang}/dashboard/`;

        if (isAtDashboardRoot && targetPath && pathname !== targetPath) {
            router.replace(targetPath);
        } else {
            // Check if user is trying to access a restricted dashboard area (e.g. Patient trying to access /admin)
            // But for now, we just stop the routing state to show the layout.
            setIsRouting(false);
        }

    }, [user, userProfile, isLoading, router, pathname]);

    if (isLoading || isRouting) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-muted-foreground animate-pulse font-medium">Synchronizing clinical session...</p>
            </div>
        );
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] relative z-10">
            <DashboardSidebar lang={lang} dict={dict} />
            <div className="flex flex-col h-screen overflow-hidden">
                <DashboardHeader lang={lang} dict={dict} />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-8 lg:p-8 overflow-auto bg-slate-950/60 backdrop-blur-md">
                    {children}
                </main>
            </div>
        </div>
    );
}
