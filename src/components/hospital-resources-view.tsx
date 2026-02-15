'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BedDouble, Hospital, Users, Activity } from 'lucide-react';
import type { HospitalResource } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

function ResourceItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: number | undefined | null}) {
    const isLoading = typeof value === 'undefined';
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            {isLoading ? <Skeleton className="h-5 w-8" /> : <span className="font-semibold">{value}</span>}
        </div>
    );
}

export function HospitalResourcesView() {
    const firestore = useFirestore();
    const resourceRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'hospitalResources', 'current');
    }, [firestore]);

    const { data: resources } = useDoc<HospitalResource>(resourceRef);

    return (
        <Card className="rounded-2xl shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Hospital className="w-6 h-6" />
                    Live Hospital Resources
                </CardTitle>
                <CardDescription>Real-time availability of staff and beds.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <ResourceItem icon={<BedDouble className="w-5 h-5 text-primary" />} label="Cardiology Beds" value={resources?.cardiologyBedsAvailable} />
                <ResourceItem icon={<Activity className="w-5 h-5 text-primary" />} label="Emergency Slots" value={resources?.emergencySlotsAvailable} />
                <ResourceItem icon={<Users className="w-5 h-5 text-primary" />} label="Neurologists on Duty" value={resources?.neurologistsOnDuty} />
                <ResourceItem icon={<Users className="w-5 h-5 text-primary" />} label="General Physicians" value={resources?.generalPhysiciansAvailable} />
                <ResourceItem icon={<BedDouble className="w-5 h-5 text-primary" />} label="ICU Beds" value={resources?.icuBedsAvailable} />
            </CardContent>
        </Card>
    );
}
