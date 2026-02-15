'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, LineChart, Hospital, Users, Search, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { PanelLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth, useUser } from '@/firebase';
import { useUserProfile } from '@/hooks/use-user-profile';
import { signOut } from 'firebase/auth';
import { Locale } from '@/i18n-config';
import LanguageSwitcher from './language-switcher';
import { GoogleTranslator } from './google-translator';

const navItems = (lang: Locale, dict: any, role?: string) => {
  const dashboardLabel = role ? `${role} Dashboard` : (dict.dashboard.staff?.title || 'Dashboard');
  return [
    { href: `/${lang}/dashboard`, icon: Home, label: dashboardLabel },
    { href: `/${lang}/dashboard/analytics`, icon: LineChart, label: 'Analytics' },
    { href: `/${lang}/dashboard/resources`, icon: Hospital, label: 'Resources' },
    { href: `/${lang}/dashboard/users`, icon: Users, label: 'Users' },
  ];
};

export function DashboardHeader({ lang, dict }: { lang: Locale; dict: any }) {
  const pathname = usePathname();
  const userAvatar = PlaceHolderImages.find(p => p.id === 'doctor-avatar-1');
  const { user } = useUser();
  const { role } = useUserProfile();
  const auth = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push(`/${lang}/login`);
  };

  const navigation = navItems(lang, dict, role);

  if (!mounted) return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
      <div className="flex-1 md:grow-0" />
      <div className="ml-auto" />
    </header>
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="md:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <div className="flex h-16 items-center px-4 border-b">
              <Logo lang={lang} />
            </div>
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
                  {
                    'text-foreground': pathname === item.href,
                  }
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="relative flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search patients..."
          className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <GoogleTranslator />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <Avatar>
                {user?.photoURL && <AvatarImage src={user.photoURL} alt="User Avatar" />}
                {user?.isAnonymous && userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" />}
                <AvatarFallback>{user?.email ? user.email.charAt(0).toUpperCase() : 'G'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.isAnonymous ? 'Guest' : (user?.displayName || user?.email)}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
