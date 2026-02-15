'use client';

import { useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { FileText, Download, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import type { Patient } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function PatientTriageHistory({ patientUserId }: { patientUserId: string }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const historyRef = useMemoFirebase(() => {
        if (!firestore || !patientUserId) return null;
        return query(
            collection(firestore, 'patients'),
            where('patientUserId', '==', patientUserId),
            orderBy('createdAt', 'desc')
        );
    }, [firestore, patientUserId]);

    const { data: history, isLoading, error } = useCollection<Patient>(historyRef);

    const [showHardError, setShowHardError] = useState(false);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setShowHardError(true), 3000);
            return () => clearTimeout(timer);
        } else {
            setShowHardError(false);
        }
    }, [error]);

    const handleDownloadReport = (patient: Patient) => {
        toast({
            title: 'Report Generated',
            description: `Downloading PDF report for visit on ${format(new Date(patient.createdAt), 'PPP')}.`,
        });
        // In a real app, logic to generate/download PDF
    };

    if (isLoading || !mounted || (error && !showHardError)) return (
        <Card className="rounded-2xl shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm h-[500px] flex items-center justify-center">
            <Clock className="w-8 h-8 animate-spin text-primary" />
        </Card>
    );

    if (error && showHardError) return (
        <Card className="rounded-2xl shadow-lg border-destructive/20 bg-destructive/5 backdrop-blur-sm h-[500px] flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-lg font-bold text-destructive uppercase tracking-tight mb-2">History Sync Failed</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
                {error instanceof Error ? error.message : 'An unexpected security or data error occurred.'}
            </p>
            <div className="text-[10px] bg-background p-3 rounded border border-destructive/10 font-mono text-left max-w-sm overflow-hidden">
                <p className="font-bold text-destructive mb-1 uppercase tracking-widest">Diagnostic Info:</p>
                <p>CODE: {JSON.stringify((error as any)?.code) || (error as any)?.name || 'NONE'}</p>
                <p>MSG: {error instanceof Error ? error.message.slice(0, 150) : 'Check console'}</p>
                <p>PATH: patients/</p>
            </div>
        </Card>
    );

    return (
        <Card className="rounded-2xl shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    Personal Triage History
                </CardTitle>
                <CardDescription>Review your past visits and download medical reports.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-[500px]">
                    <div className="space-y-4 p-6 pb-12">
                        {history?.map((entry) => (
                            <div key={entry.id} className="p-4 rounded-xl border bg-background/50 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        {format(new Date(entry.createdAt), 'PPP')}
                                    </div>
                                    <Badge variant={entry.riskLevel === 'Critical' ? 'destructive' : 'secondary'}>
                                        {entry.riskLevel} Priority
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Department</p>
                                        <p className="text-sm font-semibold">{entry.assignedDepartment}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Wait Time</p>
                                        <p className="text-sm font-semibold">{entry.waitTime} minutes</p>
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
                                    <p className="font-semibold mb-1 text-foreground">AI Insight:</p>
                                    {entry.aiExplanation}
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                    <div className="flex items-center gap-2 text-xs">
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                        <span className="text-muted-foreground">Status: {entry.status}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 gap-2" onClick={() => handleDownloadReport(entry)}>
                                        <Download className="w-3 h-3" />
                                        PDF Report
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {(!history || history.length === 0) && (
                            <div className="text-center py-12 text-muted-foreground">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No triage history found.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
