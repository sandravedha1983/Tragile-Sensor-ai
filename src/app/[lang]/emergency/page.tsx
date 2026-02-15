'use client';

import { useState } from 'react';
import { PatientIntakeForm } from '@/components/patient-intake-form';
import type { Patient } from '@/lib/types';
import type { TriageOutput } from '@/ai/flows/orchestrator-types';
import { HospitalResourcesView } from '@/components/hospital-resources-view';
import { DoctorAvailabilityView } from '@/components/doctor-availability-view';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { addDocumentNonBlocking, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useUserProfile } from '@/hooks/use-user-profile';

export default function EmergencyPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isLoading: isUserLoading } = useUserProfile();
  const [lastTriage, setLastTriage] = useState<TriageOutput | null>(null);

  const handleNewPatient = async (triageResult: TriageOutput) => {
    if (!firestore || !user) {
      toast({
        variant: "destructive",
        title: "System Not Ready",
        description: "Please wait for the system to initialize or try refreshing the page."
      });
      return;
    }

    try {
      const newPatientData: Omit<Patient, 'id'> = {
        ...(triageResult as any),
        patientUserId: user.uid,
        createdAt: new Date().toISOString(),
        avatarUrl: `https://picsum.photos/seed/guest${Date.now()}/40/40`,
      };

      const patientsCollection = collection(firestore, 'patients');
      await addDocumentNonBlocking(patientsCollection, newPatientData);

      setLastTriage(triageResult);
      toast({
        title: 'Triage Submitted',
        description: `Your information has been processed. Estimated wait time: ${triageResult.waitTime} minutes.`,
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "An error occurred while saving the triage result. Please try again."
      });
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground animate-pulse">Initializing emergency services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-1 items-start gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <PatientIntakeForm onSubmit={handleNewPatient} />
      </div>
      <div className="flex flex-col gap-6">
        {lastTriage && (
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Your Triage Result</CardTitle>
              <CardDescription>Based on the information you provided.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Department</p>
                  <p className="text-lg font-bold">{lastTriage.assignedDepartment}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Est. Wait Time</p>
                  <p className="text-lg font-bold">{lastTriage.waitTime} min</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50 border">
                <p className="font-semibold mb-2 text-foreground">AI Explanation:</p>
                {lastTriage.aiExplanation}
              </div>
              {lastTriage.rerouting_reason && (
                <div className="text-sm p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-semibold">Patient Rerouted</p>
                    <p>{lastTriage.rerouting_reason}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        <HospitalResourcesView />
        <DoctorAvailabilityView />
      </div>
    </div>
  );
}
