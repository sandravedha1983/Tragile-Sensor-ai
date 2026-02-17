'use client';

import { useState, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { User, Activity, MapPin, Coffee, Home, Stethoscope } from 'lucide-react';
import type { Doctor } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

export function DoctorProfileManager({ userId }: { userId: string }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const doctorRef = useMemoFirebase(() => {
        if (!firestore || !userId) return null;
        return doc(firestore, 'doctors', userId);
    }, [firestore, userId]);

    const { data: doctor, isLoading } = useDoc<Doctor>(doctorRef);
    const [isSaving, setIsSaving] = useState(false);

    const handleStatusChange = async (value: string, type: 'status' | 'specialization') => {
        if (!doctorRef) return;
        setIsSaving(true);

        try {
            if (type === 'status') {
                await updateDocumentNonBlocking(doctorRef, {
                    availabilityStatus: value as Doctor['availabilityStatus'],
                    locationType: (value === 'AvailableAtHospital' ? 'Hospital' : value === 'AvailableForHomeVisit' ? 'HomeVisit' : doctor?.locationType) as Doctor['locationType']
                });
            } else {
                await updateDocumentNonBlocking(doctorRef, { specialization: value });
                // Also update user profile
                if (firestore && userId) {
                    await updateDocumentNonBlocking(doc(firestore, 'users', userId), { specialization: value });
                }
            }
            toast({
                title: 'Profile Updated',
                description: `${type === 'status' ? 'Status' : 'Specialization'} updated successfully.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update profile.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div>Loading profile...</div>;

    return (
        <Card className="rounded-2xl shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/20">
                    <img src={doctor?.avatarUrl || `https://picsum.photos/seed/${userId}/64/64`} alt={doctor?.name} className="w-full h-full object-cover" />
                </div>
                <div>
                    <CardTitle className="font-headline">{doctor?.name || 'Dr. Specialist'}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                        <Stethoscope className="w-3 h-3" /> {doctor?.specialization || 'General Physician'}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label className="text-sm font-semibold mb-4 block">Specialization</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {['Cardiology', 'Neurology', 'General Medicine', 'Emergency', 'Orthopedics'].map((spec) => (
                            <Button
                                key={spec}
                                variant={doctor?.specialization === spec ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusChange(spec, 'specialization')}
                                disabled={isSaving}
                                className="justify-start truncate"
                            >
                                {spec}
                            </Button>
                        ))}
                    </div>
                </div>

                <div>
                    <Label className="text-sm font-semibold mb-4 block">Current Availability Status</Label>
                    <RadioGroup
                        defaultValue={doctor?.availabilityStatus}
                        onValueChange={(v) => handleStatusChange(v, 'status')}
                        disabled={isSaving}
                        className="grid gap-3"
                    >
                        <div className="flex items-center space-x-2 rounded-xl border p-3 hover:bg-muted/50 transition-colors cursor-pointer has-[:checked]:bg-primary/5 has-[:checked]:border-primary">
                            <RadioGroupItem value="AvailableAtHospital" id="hospital" />
                            <Label htmlFor="hospital" className="flex flex-1 items-center gap-3 cursor-pointer">
                                <Activity className="w-4 h-4 text-green-500" />
                                <div>
                                    <p className="font-medium">Available at Hospital</p>
                                    <p className="text-xs text-muted-foreground">Ready for in-person triage.</p>
                                </div>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-xl border p-3 hover:bg-muted/50 transition-colors cursor-pointer has-[:checked]:bg-primary/5 has-[:checked]:border-primary">
                            <RadioGroupItem value="AvailableForHomeVisit" id="home" />
                            <Label htmlFor="home" className="flex flex-1 items-center gap-3 cursor-pointer">
                                <Home className="w-4 h-4 text-blue-500" />
                                <div>
                                    <p className="font-medium">Available for Home Visit</p>
                                    <p className="text-xs text-muted-foreground">On call for community visits.</p>
                                </div>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-xl border p-3 hover:bg-muted/50 transition-colors cursor-pointer has-[:checked]:bg-primary/5 has-[:checked]:border-primary">
                            <RadioGroupItem value="OnBreak" id="break" />
                            <Label htmlFor="break" className="flex flex-1 items-center gap-3 cursor-pointer">
                                <Coffee className="w-4 h-4 text-orange-500" />
                                <div>
                                    <p className="font-medium">On Break</p>
                                    <p className="text-xs text-muted-foreground">Short break, returning soon.</p>
                                </div>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-xl border p-3 hover:bg-muted/50 transition-colors cursor-pointer has-[:checked]:bg-primary/5 has-[:checked]:border-primary">
                            <RadioGroupItem value="NotAvailable" id="not-available" />
                            <Label htmlFor="not-available" className="flex flex-1 items-center gap-3 cursor-pointer">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Off Duty</p>
                                    <p className="text-xs text-muted-foreground">Logged out of the system.</p>
                                </div>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="pt-4 border-t">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-3">
                            <Activity className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Patient Load</span>
                        </div>
                        <Badge variant="secondary">{doctor?.currentPatientsLoad || 0} Active</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
