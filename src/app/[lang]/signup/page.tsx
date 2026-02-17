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
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useState, use } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { doc, setDoc } from 'firebase/firestore';
import { Locale } from '@/i18n-config';
import { mapAuthError } from '@/lib/auth-errors';

import { GoogleTranslator } from '@/components/google-translator';

export default function SignupPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = use(params);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Doctor' | 'TriageStaff' | 'Patient' | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    if (!role) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: 'Please select a role.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      // Send email verification
      const actionCodeSettings = {
        url: `${window.location.origin}/${lang}/login`,
        handleCodeInApp: !!process.env.NEXT_PUBLIC_FIREBASE_HANDLE_CODE_IN_APP,
      };
      await sendEmailVerification(user, actionCodeSettings);

      await updateProfile(user, { displayName: name });

      const userData = {
        id: user.uid,
        email: user.email,
        name: name,
        role: role,
        emailVerified: false, // Explicitly track verification status
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create user document (BLOCKING write for consistency)
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, userData);

      // Create role document for role-based security rules
      let roleCollectionName = '';
      if (role === 'Doctor') roleCollectionName = 'roles_doctors';
      else if (role === 'TriageStaff') roleCollectionName = 'roles_triage_staff';
      else if (role === 'Patient') roleCollectionName = 'roles_patients';

      if (roleCollectionName) {
        const roleDocRef = doc(firestore, roleCollectionName, user.uid);
        await setDocumentNonBlocking(roleDocRef, userData, { merge: false });
      }

      // Sign out the user immediately after signup to enforce verification on login
      await signOut(auth);

      toast({
        title: 'Signup Successful',
        description: 'Verification email sent! Please verify your email before logging in.'
      });
      router.push(`/${lang}/login`);
    } catch (error: any) {
      console.error('Signup Error Detailed:', error);
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: mapAuthError(error),
      });
    } finally {
      setIsLoading(false);
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
          <CardTitle className="font-headline text-2xl">Create an Account</CardTitle>
          <CardDescription>Enter your details to get started.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form className="grid gap-4" onSubmit={handleSignup}>
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" type="text" placeholder="Amelia Vance" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="vance@triagesense.ai" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={(value) => setRole(value as any)} value={role}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Doctor">Doctor</SelectItem>
                  <SelectItem value="TriageStaff">Triage Staff</SelectItem>
                  <SelectItem value="Patient">Patient</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
            </Button>
          </form>
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link href={`/${lang}/login`} className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
