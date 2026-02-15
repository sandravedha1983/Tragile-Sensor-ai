'use client';

import { useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { User, Clock, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import type { Patient } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

export function DoctorPatientList({ doctorId, onPatientSelect }: { doctorId: string; onPatientSelect?: (patient: Patient) => void }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const patientsRef = useMemoFirebase(() => {
        if (!firestore) return null;
        // Optimization: Limit to top 50 most urgent patients to prevent lag
        return query(
            collection(firestore, 'patients'),
            orderBy('urgencyIndex', 'desc'),
            limit(50)
        );
    }, [firestore]);

    const { data: patients, isLoading } = useCollection<Patient>(patientsRef);

    const handleStatusUpdate = async (patientId: string, newStatus: Patient['status']) => {
        if (!firestore) return;
        const patientDocRef = query(collection(firestore, 'patients'), where('id', '==', patientId));
        // Need to fix this - useDoc/doc is better if we have the ID directly
        // Wait, useCollection returns docs with 'id' property.

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

    const filteredPatients = patients || [];

    return (
        <Card className="rounded-2xl shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <User className="w-6 h-6 text-primary" />
                    Assigned Patients
                </CardTitle>
                <CardDescription>Patients currently under your care.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-[500px] px-6">
                    <div className="space-y-4 pb-6">
                        {filteredPatients.map((patient) => (
                            <div key={patient.id} className="flex items-center justify-between p-4 rounded-xl border bg-background/50 hover:bg-background/80 transition-colors cursor-pointer group"
                                onClick={() => {
                                    setSelectedPatient(patient);
                                    onPatientSelect?.(patient);
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {patient.name[0]}
                                    </div>
                                    <div>
                                        <div className="font-semibold flex items-center gap-2">
                                            {patient.name}
                                            {patient.riskLevel === 'Critical' && <AlertCircle className="w-4 h-4 text-destructive" />}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                                            <Clock className="w-3 h-3" /> {patient.assignedDepartment} • Wait: {patient.waitTime}m
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant={patient.status === 'Waiting' ? 'secondary' : patient.status === 'In Progress' ? 'default' : 'outline'}>
                                        {patient.status}
                                    </Badge>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {selectedPatient && (
                    <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{selectedPatient.name}'s Profile</DialogTitle>
                                <DialogDescription>Review details and AI explanations.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-muted/50 border">
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Symptoms</p>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedPatient.symptoms.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-muted/50 border">
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Urgency Index</p>
                                        <p className="text-2xl font-bold text-primary">{selectedPatient.urgencyIndex}</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <Cpu className="w-4 h-4" /> AI Explanation
                                    </p>
                                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                                        "{selectedPatient.aiExplanation}"
                                    </p>
                                </div>

                                <div className="flex justify-between items-center pt-4">
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(selectedPatient.id, 'Waiting')}>Wait</Button>
                                        <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(selectedPatient.id, 'In Progress')}>Treat</Button>
                                        <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(selectedPatient.id, 'Discharged')}>Discharge</Button>
                                    </div>
                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                        <CheckCircle className="w-3 h-3 mr-1" /> Verified
                                    </Badge>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </CardContent>
        </Card>
    );
}

function Cpu({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="16" x="4" y="4" rx="2" /><rect width="6" height="6" x="9" y="9" rx="1" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" /></svg>;
}
