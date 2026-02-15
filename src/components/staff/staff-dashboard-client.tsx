'use client';

import { useState } from 'react';
import { LiveTriageQueue } from '@/components/live-triage-queue';
import { HospitalResourcesView } from '@/components/hospital-resources-view';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Patient } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users, Activity } from 'lucide-react';

export function StaffDashboardClient({ dict }: { dict: any }) {
    const firestore = useFirestore();
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

    const patientsRef = useMemoFirebase(() => {
        if (!firestore) return null;
        // Staff needs to see the global queue
        return query(
            collection(firestore, 'patients'),
            orderBy('urgencyIndex', 'desc'),
            limit(100)
        );
    }, [firestore]);

    const { data: patients, isLoading } = useCollection<Patient>(patientsRef);

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Start {dict.dashboard?.staff?.title || 'Triage Operations'}
                </h1>
                <p className="text-muted-foreground">
                    Live queue management and resource allocation.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3 h-[calc(100vh-12rem)]">
                {/* Left Column: Live Queue (Takes up 2 columns) */}
                <div className="lg:col-span-2 h-full flex flex-col">
                    <LiveTriageQueue
                        patients={patients || []}
                        onPatientSelect={(p) => setSelectedPatientId(p.id)}
                        selectedPatientId={selectedPatientId || undefined}
                    />
                </div>

                {/* Right Column: Resources & Quick Stats */}
                <div className="space-y-6">
                    <HospitalResourcesView />

                    <Card className="rounded-2xl shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                Queue Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 border border-primary/10">
                                <span className="text-sm font-medium text-muted-foreground">Critical Cases</span>
                                <span className="text-xl font-black text-red-500">
                                    {patients?.filter(p => p.riskLevel === 'Critical').length || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 border border-primary/10">
                                <span className="text-sm font-medium text-muted-foreground">Avg Wait Time</span>
                                <span className="text-xl font-black text-primary">
                                    {Math.round((patients || []).reduce((acc, curr) => acc + curr.waitTime, 0) / ((patients || []).length || 1))}m
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {selectedPatientId && (
                        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center animate-in fade-in zoom-in duration-300">
                            <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Selected Patient ID</p>
                            <code className="text-sm font-mono bg-background/50 px-2 py-1 rounded">{selectedPatientId}</code>
                            <p className="text-[10px] text-muted-foreground mt-2">
                                (Staff View: Clinical details hidden)
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
