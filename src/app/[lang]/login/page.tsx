'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Shield, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useState, use } from 'react';
import { Locale } from '@/i18n-config';

import { GoogleTranslator } from '@/components/google-translator';

export default function LoginPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = use(params);
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Login Successful' });
      router.push(`/${lang}/dashboard`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyAccess = async () => {
    if (!auth) return;
    setIsGuestLoading(true);
    try {
      await signInAnonymously(auth);
      toast({ title: 'Emergency Access Granted', description: 'Redirecting to emergency dashboard.' });
      router.push(`/${lang}/emergency`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Emergency Access Failed',
        description: error.message,
      });
    } finally {
      setIsGuestLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-8 flex flex-col items-center gap-4">
        <Logo lang={lang} />
        <GoogleTranslator />
      </div>
      <Card className="w-full max-w-sm rounded-2xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Command Center Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form className="grid gap-4" onSubmit={handleLogin}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="vance@triagesense.ai" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !auth}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </Button>
          </form>
          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href={`/${lang}/signup`} className="underline">
              Sign up
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          <Button variant="secondary" onClick={handleEmergencyAccess} disabled={isGuestLoading || !auth}>
            {isGuestLoading ? <Loader2 className="animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
            Emergency Access
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
