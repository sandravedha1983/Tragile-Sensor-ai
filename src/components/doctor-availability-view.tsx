'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import type { Doctor } from '@/lib/types';
import { Stethoscope } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const availabilityColorMap: { [key: string]: string } = {
    AvailableAtHospital: 'bg-green-500/20 text-green-500 border-green-500/30',
    AvailableForHomeVisit: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    OnBreak: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    NotAvailable: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export function DoctorAvailabilityView() {
    const firestore = useFirestore();
    const doctorsRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'doctors');
    }, [firestore]);

    const { data: doctors, isLoading } = useCollection<Doctor>(doctorsRef);
    const doctorAvatar = PlaceHolderImages.find(p => p.id === 'doctor-avatar-1');

    return (
        <Card className="rounded-2xl shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Stethoscope className="w-6 h-6" />
                    Doctor Availability
                </CardTitle>
                <CardDescription>Live status of available medical staff.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-64">
                    <div className="grid gap-4">
                        {isLoading && Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="grid gap-1">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </div>
                        ))}
                        {doctors?.map(doctor => (
                            <div key={doctor.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={doctor.avatarUrl || doctorAvatar?.imageUrl} alt={doctor.name} />
                                        <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{doctor.name}</p>
                                        <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className={cn(availabilityColorMap[doctor.availabilityStatus])}>{doctor.availabilityStatus.replace(/([A-Z])/g, ' $1').trim()}</Badge>
                            </div>
                        ))}
                        {!isLoading && doctors?.length === 0 && <p className="text-muted-foreground text-center">No doctors found.</p>}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
