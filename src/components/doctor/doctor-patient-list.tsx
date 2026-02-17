'use client';

import { useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { User, Clock, AlertCircle, CheckCircle, ChevronRight, Activity, Cpu, Stethoscope } from 'lucide-react';
import type { Patient } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

export function DoctorPatientList({
    doctorId,
    onPatientSelect,
    specialization
}: {
    doctorId: string;
    onPatientSelect?: (patient: Patient) => void;
    specialization?: string;
}) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const patientsRef = useMemoFirebase(() => {
        if (!firestore) return null;
        // Optimization: Limit to top 50 most urgent patients
        return query(
            collection(firestore, 'patients'),
            orderBy('urgencyIndex', 'desc'),
            limit(50)
        );
    }, [firestore]);

    const { data: patients, isLoading } = useCollection<Patient>(patientsRef);

    const handleStatusUpdate = async (patientId: string, newStatus: Patient['status']) => {
        if (!firestore) return;
        try {
            const patientDocRef = doc(firestore, 'patients', patientId);
            updateDocumentNonBlocking(patientDocRef, { status: newStatus });

            toast({
                title: 'Status Updated',
                description: `Patient is now marked as ${newStatus}.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update patient status.',
                variant: 'destructive',
            });
        }
    };

    if (isLoading || !mounted) return (
        <Card className="rounded-2xl shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm h-[500px] flex items-center justify-center">
            <User className="w-8 h-8 animate-spin text-primary" />
        </Card>
    );

    // Sorting Logic: 
    // 1. Urgency Index (already partially handled by query, but we refinement for specialization)
    // 2. Department match score if specialization is provided
    const sortedPatients = [...(patients || [])].sort((a, b) => {
        // Base sorting by urgency index
        if (b.urgencyIndex !== a.urgencyIndex) {
            return b.urgencyIndex - a.urgencyIndex;
        }

        // Tier 2: Specialization score match
        if (specialization) {
            const aScore = a.departmentFitScores?.find(s => s.department === specialization)?.score || 0;
            const bScore = b.departmentFitScores?.find(s => s.department === specialization)?.score || 0;
            return bScore - aScore;
        }

        return 0;
    });

    return (
        <Card className="rounded-2xl shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <User className="w-6 h-6 text-primary" />
                            Clinical Queue
                        </CardTitle>
                        <CardDescription>
                            {specialization ? `Prioritizing ${specialization} matches` : 'Patients currently awaiting triage'}
                        </CardDescription>
                    </div>
                    {specialization && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                            <Stethoscope className="w-3 h-3 mr-1" />
                            Focused
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-[500px] px-6">
                    <div className="space-y-4 pb-6">
                        {sortedPatients.map((patient) => {
                            const specMatchScore = specialization
                                ? patient.departmentFitScores?.find(s => s.department === specialization)?.score
                                : null;

                            return (
                                <div key={patient.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group ${specMatchScore && specMatchScore > 0.7
                                    ? 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                                    : 'bg-background/50 hover:bg-background/80'
                                    }`}
                                    onClick={() => {
                                        setSelectedPatient(patient);
                                        onPatientSelect?.(patient);
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${patient.riskLevel === 'Critical' ? 'bg-destructive/20 text-destructive' : 'bg-primary/10 text-primary'
                                            }`}>
                                            {patient.name[0]}
                                        </div>
                                        <div>
                                            <div className="font-semibold flex items-center gap-2">
                                                {patient.name}
                                                {patient.riskLevel === 'Critical' && <AlertCircle className="w-4 h-4 text-destructive" />}
                                                {specMatchScore && specMatchScore > 0.8 && (
                                                    <Badge variant="secondary" className="h-4 text-[8px] px-1 uppercase letter-spacing-widest">Spec Match</Badge>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                <Clock className="w-3 h-3" /> {patient.assignedDepartment} • Wait: {patient.waitTime}m
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right mr-2 hidden sm:block">
                                            <p className={`text-xs font-bold ${patient.riskLevel === 'Critical' ? 'text-destructive' : 'text-primary'}`}>
                                                {patient.urgencyIndex}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground uppercase opacity-70">Urgency</p>
                                        </div>
                                        <Badge variant={patient.status === 'Waiting' ? 'secondary' : patient.status === 'In Progress' ? 'default' : 'outline'}>
                                            {patient.status}
                                        </Badge>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

                {selectedPatient && (
                    <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
                        <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black tracking-tighter uppercase">{selectedPatient.name}</DialogTitle>
                                <DialogDescription className="text-slate-400 font-medium">Clinical Profile & AI Evaluation</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 shadow-inner">
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Status</p>
                                        <Badge variant="outline" className="border-primary/50 text-primary">{selectedPatient.status}</Badge>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 shadow-inner">
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Urgency Index</p>
                                        <p className="text-3xl font-black text-primary tracking-tighter">{selectedPatient.urgencyIndex}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 shadow-inner">
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Risk Level</p>
                                        <p className={`text-lg font-bold ${selectedPatient.riskLevel === 'Critical' ? 'text-destructive' : 'text-primary'}`}>
                                            {selectedPatient.riskLevel}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Activity className="w-32 h-32 text-primary" />
                                    </div>
                                    <p className="text-sm font-bold mb-3 flex items-center gap-2 text-primary uppercase tracking-widest">
                                        <Cpu className="w-4 h-4" /> AI CLINCAL REASONING
                                    </p>
                                    <p className="text-sm text-slate-300 italic leading-relaxed font-medium">
                                        "{selectedPatient.aiExplanation}"
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Clinical Protocol Action</p>
                                    <div className="flex flex-wrap gap-3">
                                        <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-widest px-6" onClick={() => handleStatusUpdate(selectedPatient.id, 'Waiting')}>Defer</Button>
                                        <Button variant="default" className="rounded-xl bg-primary hover:bg-primary/90 text-xs font-black uppercase tracking-widest px-8 shadow-lg shadow-primary/20" onClick={() => handleStatusUpdate(selectedPatient.id, 'In Progress')}>Initiate Treatment</Button>
                                        <Button variant="secondary" className="rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold uppercase tracking-widest px-6" onClick={() => handleStatusUpdate(selectedPatient.id, 'Discharged')}>Discharge</Button>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </CardContent>
        </Card>
    );
}



