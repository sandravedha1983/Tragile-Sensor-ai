'use client';

import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Shield, User } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function UserRoleManager() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const profilesRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'userProfiles');
    }, [firestore]);

    const { data: profiles, isLoading } = useCollection<UserProfile>(profilesRef);

    const handleRoleChange = async (userId: string, newRole: UserProfile['role']) => {
        if (!firestore) return;
        const profileDocRef = doc(firestore, 'userProfiles', userId);

        try {
            await updateDocumentNonBlocking(profileDocRef, { role: newRole, updatedAt: new Date().toISOString() });
            toast({
                title: 'Role Updated',
                description: `User role has been changed to ${newRole}.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update user role.',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) return <div>Loading users...</div>;

    return (
        <Card className="rounded-2xl shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" />
                    Manage Users & Roles
                </CardTitle>
                <CardDescription>Assign roles to system users.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Current Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {profiles?.map((profile) => (
                                <TableRow key={profile.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="w-4 h-4 text-primary" />
                                        </div>
                                        {profile.name}
                                    </TableCell>
                                    <TableCell>{profile.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={profile.role === 'Admin' ? 'destructive' : 'secondary'}>
                                            {profile.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Select
                                            onValueChange={(value) => handleRoleChange(profile.id, value as UserProfile['role'])}
                                            defaultValue={profile.role}
                                        >
                                            <SelectTrigger className="w-[140px] ml-auto">
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Admin">Admin</SelectItem>
                                                <SelectItem value="Doctor">Doctor</SelectItem>
                                                <SelectItem value="TriageStaff">Triage Staff</SelectItem>
                                                <SelectItem value="Patient">Patient</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
