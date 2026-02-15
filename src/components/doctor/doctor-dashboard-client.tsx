'use client';

import { DoctorPatientList } from '@/components/doctor/doctor-patient-list';
import { DoctorProfileManager } from '@/components/doctor/doctor-profile-manager';
import { useUserProfile } from '@/hooks/use-user-profile';
import { StatCard } from '@/components/stat-card';
import { Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { AiInsights } from '@/components/ai-insights';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Patient } from '@/lib/types';
import { useState } from 'react';

export function DoctorDashboardClient({ dict }: { dict: any }) {
    const { user } = useUserProfile();
    const firestore = useFirestore();
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const patientsRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'patients');
    }, [firestore]);

    const { data: patients } = useCollection<Patient>(patientsRef);

    return (
        <div className="container mx-auto p-4 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    {dict.dashboard.physician.title}
                </h1>
                <p className="text-muted-foreground">
                    {dict.dashboard.physician.description}
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-4">
                    <DoctorPatientList doctorId={user?.uid || ''} onPatientSelect={setSelectedPatient} />
                </div>
                <div className="lg:col-span-4">
                    <AiInsights patient={selectedPatient} />
                </div>
                <div className="lg:col-span-4">
                    {user ? <DoctorProfileManager userId={user.uid} /> : null}
                </div>
            </div>
        </div>
    );
}
