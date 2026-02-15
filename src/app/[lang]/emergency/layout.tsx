'use client';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useState, use } from 'react';
import { Locale } from '@/i18n-config';
import { GoogleTranslator } from '@/components/google-translator';


export default function EmergencyLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = use(params);
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      router.push(`/${lang}/login`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/40 uppercase">
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-card px-4 sm:px-6">
        <Logo lang={lang} />
        <div className="ml-auto flex items-center gap-3">
          <GoogleTranslator />
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Exit Emergency Access
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 lg:gap-6 lg:p-6">{children}</main>
    </div>
  );
}
