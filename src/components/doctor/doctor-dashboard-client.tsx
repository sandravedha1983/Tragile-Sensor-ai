import { DoctorPatientList } from '@/components/doctor/doctor-patient-list';
import { DoctorProfileManager } from '@/components/doctor/doctor-profile-manager';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Patient } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User, Clock, AlertCircle, CheckCircle, ChevronRight, Activity, Stethoscope } from 'lucide-react';
import { AiInsights } from '@/components/ai-insights';

export function DoctorDashboardClient({ dict }: { dict: any }) {
    const { user, userProfile, isLoading: isProfileLoading } = useUserProfile();
    const firestore = useFirestore();
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [showSpecPrompt, setShowSpecPrompt] = useState(false);

    useEffect(() => {
        if (!isProfileLoading && userProfile && !userProfile.specialization) {
            setShowSpecPrompt(true);
        } else {
            setShowSpecPrompt(false);
        }
    }, [userProfile, isProfileLoading]);

    return (
        <div className="container mx-auto p-4 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        {dict.dashboard.physician.title}
                        {userProfile?.specialization && (
                            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-3 py-1 text-sm font-semibold">
                                <Stethoscope className="w-4 h-4 mr-2" />
                                {userProfile.specialization}
                            </Badge>
                        )}
                    </h1>
                    <p className="text-muted-foreground">
                        {dict.dashboard.physician.description}
                    </p>
                </div>
                {userProfile && (
                    <div className="bg-card/50 backdrop-blur-sm border p-4 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {userProfile.name[0]}
                        </div>
                        <div>
                            <p className="font-bold text-sm">{userProfile.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{userProfile.role}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-8">
                    <DoctorPatientList
                        doctorId={user?.uid || ''}
                        onPatientSelect={setSelectedPatient}
                        specialization={userProfile?.specialization}
                    />
                </div>
                <div className="lg:col-span-4 space-y-6">
                    <AiInsights patient={selectedPatient} />
                    {user ? <DoctorProfileManager userId={user.uid} /> : null}
                </div>
            </div>

            <Dialog open={showSpecPrompt} onOpenChange={setShowSpecPrompt}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select Your Specialization</DialogTitle>
                        <DialogDescription>
                            Please select your medical specialization to see prioritized patients matched to your expertise.
                        </DialogDescription>
                    </DialogHeader>
                    {user && <DoctorProfileManager userId={user.uid} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}
