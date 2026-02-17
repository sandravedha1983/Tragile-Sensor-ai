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
import { signInWithEmailAndPassword, signInAnonymously, sendPasswordResetEmail, sendEmailVerification, signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useState, use } from 'react';
import { Locale } from '@/i18n-config';
import { mapAuthError } from '@/lib/auth-errors';

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
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setShowResend(true);
        await signOut(auth);
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Please verify your email before logging in.',
        });
        return;
      }

      toast({ title: 'Login Successful' });
      router.push(`/${lang}/dashboard`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: mapAuthError(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!auth) return;
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter your email address first.',
      });
      return;
    }

    setIsResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Success',
        description: 'Password reset link has been sent to your email.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: mapAuthError(error),
      });
    } finally {
      setIsResetLoading(false);
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
        description: mapAuthError(error),
      });
    } finally {
      setIsGuestLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!auth || !email || !password) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter your email and password to resend the verification link.',
      });
      return;
    }

    setIsResending(true);
    try {
      // We need to sign in briefly to get the user object to send the verification
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      const actionCodeSettings = {
        url: `${window.location.origin}/${lang}/login`,
        handleCodeInApp: !!process.env.NEXT_PUBLIC_FIREBASE_HANDLE_CODE_IN_APP,
      };
      await sendEmailVerification(userCredential.user, actionCodeSettings);
      await signOut(auth);

      toast({
        title: 'Success',
        description: 'Verification email resent! Please check your inbox.',
      });
      setShowResend(false);
    } catch (error: any) {
      console.error('Resend Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: mapAuthError(error),
      });
    } finally {
      setIsResending(false);
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
            <Button type="submit" className="w-full" disabled={isLoading || isResetLoading || !auth}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </Button>
            {showResend && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 text-xs font-semibold"
                onClick={handleResendVerification}
                disabled={isResending}
              >
                {isResending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : null}
                Didn&apos;t receive the email? Resend verification
              </Button>
            )}
          </form>
          <div className="flex flex-col gap-2 text-center text-sm">
            <div>
              Don&apos;t have an account?{' '}
              <Link href={`/${lang}/signup`} className="underline">
                Sign up
              </Link>
            </div>
            <button
              onClick={handleForgotPassword}
              className="text-muted-foreground underline hover:text-primary transition-colors"
              disabled={isResetLoading}
            >
              {isResetLoading ? 'Sending...' : 'Forgot Password?'}
            </button>
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
