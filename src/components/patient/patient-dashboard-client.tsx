'use client';

import { useState, useEffect } from 'react';

import { PatientTriageHistory } from '@/components/patient-triage-history';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/stat-card';
import { Clock, User, Heart, Activity, AlertCircle } from 'lucide-react';
import type { Patient } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AiInsights } from '@/components/ai-insights';
import { AppointmentBooking } from '@/components/patient/appointment-booking';
import { VoiceAssistant } from '@/components/patient/voice-assistant';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PatientIntakeForm } from '@/components/patient-intake-form';

export function PatientDashboardClient({ dict }: { dict: any }) {
    const { user } = useUserProfile();
    const firestore = useFirestore();
    const [mounted, setMounted] = useState(false);
    const [showIntake, setShowIntake] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const latestRef = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        return query(
            collection(firestore, 'patients'),
            where('patientUserId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(1)
        );
    }, [firestore, user?.uid]);

    const { data: latestCerts, isLoading: isLoadingLatest, error: patientsError } = useCollection<Patient>(latestRef);
    const latestTriage = latestCerts?.[0];

    const [showHardError, setShowHardError] = useState(false);

    useEffect(() => {
        if (patientsError) {
            const timer = setTimeout(() => setShowHardError(true), 3000);
            return () => clearTimeout(timer);
        } else {
            setShowHardError(false);
        }
    }, [patientsError]);

    // Safety for dictionary values
    const d = dict?.dashboard?.patient || { title: 'Patient Dashboard', description: 'Track your status.' };

    if (patientsError && !showHardError) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-muted-foreground animate-pulse font-medium">Verifying clinical session permissions...</p>
            </div>
        );
    }

    if (patientsError && showHardError) {
        return (
            <div className="flex flex-col gap-6 h-full p-4 lg:p-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-destructive/5 border border-destructive/20 p-8 rounded-3xl text-destructive space-y-6 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertCircle className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Access Inhibited</h2>
                            <p className="text-sm font-medium opacity-80">Clinical Data Permission Failure</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <p className="text-sm font-medium leading-relaxed">
                            The security layer is currently preventing retrieval of your health records. This usually occurs during a system update or if security policies haven't been synchronized.
                        </p>
                        <div className="text-xs bg-slate-950/40 p-5 rounded-2xl font-mono text-destructive/90 overflow-x-auto border border-destructive/10">
                            ERR_CODE: {patientsError.message}
                            <br />
                            PATH: patients/
                        </div>
                    </div>
                    <div className="pt-4 border-t border-destructive/10">
                        <p className="text-xs font-bold uppercase tracking-widest mb-3 opacity-90">Required Administrative Action:</p>
                        <div className="flex flex-col gap-2">
                            <code className="text-[10px] bg-slate-900 text-slate-100 p-3 rounded-xl border border-white/5 break-all shadow-inner">
                                firebase deploy --only firestore:rules
                            </code>
                            <p className="text-[10px] italic opacity-70">
                                Run this command in your terminal to synchronize the localized security rules with the production environment.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-primary">
                    {dict?.page?.dashboard?.welcome || 'Welcome'}, {user?.displayName || 'Patient'}
                </h1>
                <p className="text-muted-foreground text-sm font-medium">
                    {d.description}
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Current Wait"
                    value={mounted && latestTriage ? `${latestTriage.waitTime}m` : 'N/A'}
                    icon={<Clock className="h-4 w-4 text-primary" />}
                    change="Estimated"
                />
                <StatCard
                    title="Priority Score"
                    value={mounted && latestTriage ? latestTriage.urgencyIndex.toString() : 'N/A'}
                    icon={<Activity className="h-4 w-4 text-primary" />}
                    change={latestTriage?.riskLevel || 'Unknown'}
                />
                <StatCard
                    title="Assigned Dept"
                    value={latestTriage?.assignedDepartment || 'Pending'}
                    icon={<Heart className="h-4 w-4 text-red-500" />}
                    change="Routing Status"
                />
                <StatCard
                    title="Last Update"
                    value={mounted && latestTriage ? new Date(latestTriage.createdAt).toLocaleDateString() : 'N/A'}
                    icon={<User className="h-4 w-4 text-muted-foreground" />}
                    change="Real-time Sync"
                />
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-8 space-y-8">
                    <Card className="rounded-2xl shadow-xl border-primary/20 bg-gradient-to-r from-slate-900 to-slate-900/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Activity className="w-32 h-32 text-primary rotate-12" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-2xl font-black text-white flex items-center gap-2">
                                <Activity className="w-6 h-6 text-primary" />
                                New Health Assessment
                            </CardTitle>
                            <CardDescription className="text-slate-300 font-medium">
                                Feeling unwell? Our AI agent can triage your symptoms in seconds and route you to the right specialist.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Dialog open={showIntake} onOpenChange={setShowIntake}>
                                <DialogTrigger asChild>
                                    <Button size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-900/20 text-lg py-6">
                                        <Activity className="w-5 h-5 mr-2" />
                                        Start AI Triage Now
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>New Symptom Assessment</DialogTitle>
                                        <DialogDescription>
                                            AI will analyze your symptoms and route you to the correct department.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <PatientIntakeForm onSubmit={async (result) => {
                                        if (user && firestore) {
                                            try {
                                                await addDocumentNonBlocking(collection(firestore, 'patients'), {
                                                    ...result,
                                                    patientUserId: user.uid,
                                                    createdAt: new Date().toISOString(),
                                                    avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`
                                                });
                                                setShowIntake(false);
                                            } catch (e) {
                                                console.error("Failed to save triage", e);
                                            }
                                        }
                                    }} />
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>

                    <AppointmentBooking />
                </div>
                <div className="lg:col-span-4 space-y-6">
                    <VoiceAssistant />

                    <Card className="rounded-2xl shadow-lg border-primary/10 bg-card/40 backdrop-blur-md overflow-hidden">
                        <CardHeader className="bg-primary/5 pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                Live Status Tracking
                            </CardTitle>
                            <CardDescription className="text-xs">Real-time progress of your care.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                    <span className="text-muted-foreground">Clinical Path Progress</span>
                                    <span className="text-primary">{latestTriage?.status || 'Waiting'}</span>
                                </div>
                                <Progress
                                    value={latestTriage?.status === 'Discharged' ? 100 : latestTriage?.status === 'In Progress' ? 60 : 20}
                                    className="h-2"
                                />
                            </div>

                            <div className="p-4 rounded-xl bg-slate-900/5 border border-primary/5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase">Attending Physician</p>
                                        <p className="text-xs text-muted-foreground">Dr. Sarah Johnson (On Duty)</p>
                                    </div>
                                </div>
                                <Badge className="w-full justify-center py-2 text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:bg-primary/90 transition-colors">
                                    Send Message to Provider
                                </Badge>
                            </div>

                            <div className="text-[10px] text-muted-foreground p-3 rounded-lg border-2 border-dashed bg-muted/10">
                                <p className="font-bold mb-1 text-foreground uppercase tracking-widest italic">Live Queue Update:</p>
                                <p>You are currently #3 in the {latestTriage?.assignedDepartment || 'General'} triage queue. Estimated wait: {latestTriage?.waitTime || '20+'} minutes.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <AiInsights patient={latestTriage || null} />
                    <PatientTriageHistory patientUserId={user?.uid || ''} />
                </div>
            </div>
        </div>
    );
}
