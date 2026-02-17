'use client';

import { useState } from 'react';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw } from 'lucide-react';

export function ProfileRecovery({ user, lang }: { user: any; lang: string }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [name, setName] = useState(user?.displayName || '');
    const [role, setRole] = useState<'Doctor' | 'TriageStaff' | 'Patient' | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRecover = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore || !user || !role) return;

        setIsSubmitting(true);
        try {
            const userData = {
                id: user.uid,
                email: user.email,
                name: name,
                role: role,
                emailVerified: user.emailVerified,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // Create user document
            const userDocRef = doc(firestore, 'users', user.uid);
            await setDoc(userDocRef, userData);

            // Create role document
            let roleCollectionName = '';
            if (role === 'Doctor') roleCollectionName = 'roles_doctors';
            else if (role === 'TriageStaff') roleCollectionName = 'roles_triage_staff';
            else if (role === 'Patient') roleCollectionName = 'roles_patients';

            if (roleCollectionName) {
                const roleDocRef = doc(firestore, roleCollectionName, user.uid);
                await setDocumentNonBlocking(roleDocRef, userData, { merge: false });
            }

            toast({
                title: 'Account Repaired',
                description: 'Your profile has been restored. Redirecting...',
            });

            // Force a reload to pick up the new profile
            window.location.reload();
        } catch (error: any) {
            console.error('Recovery Error:', error);
            toast({
                variant: 'destructive',
                title: 'Recovery Failed',
                description: 'Could not restore profile. Please contact support.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background/80 backdrop-blur-sm p-4 z-50 fixed inset-0">
            <Card className="w-full max-w-md border-primary/20 shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <RefreshCw className="w-6 h-6 text-primary animate-spin-slow" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Repair Your Account</CardTitle>
                    <CardDescription>
                        We couldn't find your clinical profile. Please re-confirm your details to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRecover} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="recover-name">Full Name</Label>
                            <Input
                                id="recover-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="recover-role">Your Role</Label>
                            <Select onValueChange={(value) => setRole(value as any)} value={role}>
                                <SelectTrigger id="recover-role">
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Doctor">Doctor</SelectItem>
                                    <SelectItem value="TriageStaff">Triage Staff</SelectItem>
                                    <SelectItem value="Patient">Patient</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting || !role}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Repairing...
                                </>
                            ) : (
                                'Restore Profile & Continue'
                            )}
                        </Button>
                        <p className="text-center text-xs text-muted-foreground mt-4">
                            Authenticated as: <span className="font-mono">{user?.email}</span>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
