'use client';

import { useState } from 'react';
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { BedDouble, Hospital, Users, Activity, Save } from 'lucide-react';
import type { HospitalResource } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function AdminResourceManager() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const resourceRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'hospitalResources', 'current');
    }, [firestore]);

    const { data: resources, isLoading } = useDoc<HospitalResource>(resourceRef);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!resourceRef) return;

        setIsSaving(true);
        const formData = new FormData(e.currentTarget);

        const updatedResources: Partial<HospitalResource> = {
            cardiologyBedsAvailable: parseInt(formData.get('cardiologyBeds') as string),
            emergencySlotsAvailable: parseInt(formData.get('emergencySlots') as string),
            neurologistsOnDuty: parseInt(formData.get('neurologists') as string),
            generalPhysiciansAvailable: parseInt(formData.get('generalPhysicians') as string),
            icuBedsAvailable: parseInt(formData.get('icuBeds') as string),
            updatedAt: new Date().toISOString(),
        };

        try {
            await updateDocumentNonBlocking(resourceRef, updatedResources);
            toast({
                title: 'Resources Updated',
                description: 'Hospital resources have been successfully updated.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update resources.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div>Loading resources...</div>;

    return (
        <Card className="rounded-2xl shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Hospital className="w-6 h-6 text-primary" />
                    Manage Hospital Resources
                </CardTitle>
                <CardDescription>Update real-time availability of staff and beds.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="cardiologyBeds" className="flex items-center gap-2">
                            <BedDouble className="w-4 h-4" /> Cardiology Beds
                        </Label>
                        <Input id="cardiologyBeds" name="cardiologyBeds" type="number" defaultValue={resources?.cardiologyBedsAvailable} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="emergencySlots" className="flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Emergency Slots
                        </Label>
                        <Input id="emergencySlots" name="emergencySlots" type="number" defaultValue={resources?.emergencySlotsAvailable} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="neurologists" className="flex items-center gap-2">
                            <Users className="w-4 h-4" /> Neurologists
                        </Label>
                        <Input id="neurologists" name="neurologists" type="number" defaultValue={resources?.neurologistsOnDuty} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="generalPhysicians" className="flex items-center gap-2">
                            <Users className="w-4 h-4" /> General Physicians
                        </Label>
                        <Input id="generalPhysicians" name="generalPhysicians" type="number" defaultValue={resources?.generalPhysiciansAvailable} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="icuBeds" className="flex items-center gap-2">
                            <BedDouble className="w-4 h-4" /> ICU Beds
                        </Label>
                        <Input id="icuBeds" name="icuBeds" type="number" defaultValue={resources?.icuBedsAvailable} />
                    </div>
                    <div className="sm:col-span-2 flex justify-end mt-4">
                        <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
