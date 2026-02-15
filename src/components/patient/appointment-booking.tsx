'use client';

import { useState, useEffect } from 'react';
import { useCollection, useFirestore, useUser, addDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Stethoscope, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Doctor, Appointment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const TIME_SLOTS = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

export function AppointmentBooking() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [date, setDate] = useState<Date>();
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
    const [isBooking, setIsBooking] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const doctorsRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'doctors'),
            where('availabilityStatus', 'in', ['AvailableAtHospital', 'AvailableForHomeVisit'])
        );
    }, [firestore]);

    const { data: doctors, isLoading: isLoadingDoctors } = useCollection<Doctor>(doctorsRef);

    const handleBookAppointment = async () => {
        if (!user || !firestore || !date || !selectedDoctorId || !selectedTimeSlot) return;

        setIsBooking(true);
        const selectedDoctor = doctors?.find(d => d.id === selectedDoctorId);

        try {
            const appointmentData: Omit<Appointment, 'id'> = {
                patientId: user.uid,
                patientName: user.displayName || 'Patient',
                doctorId: selectedDoctorId,
                doctorName: selectedDoctor?.name || 'Doctor',
                date: date.toISOString(),
                timeSlot: selectedTimeSlot,
                status: 'Scheduled',
                createdAt: new Date().toISOString(),
            };

            const appointmentsCollection = collection(firestore, 'appointments');
            await addDocumentNonBlocking(appointmentsCollection, appointmentData);

            toast({
                title: 'Appointment Booked',
                description: `Your appointment with ${appointmentData.doctorName} is scheduled for ${format(date, 'PPP')} at ${selectedTimeSlot}.`,
            });

            // Reset
            setDate(undefined);
            setSelectedDoctorId('');
            setSelectedTimeSlot('');
        } catch (error) {
            console.error('Booking failed:', error);
            toast({
                variant: 'destructive',
                title: 'Booking Failed',
                description: 'An error occurred while booking your appointment.',
            });
        } finally {
            setIsBooking(false);
        }
    };

    if (!mounted) return (
        <Card className="rounded-2xl shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm h-[300px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </Card>
    );

    return (
        <Card className="rounded-2xl shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <CalendarIcon className="w-6 h-6 text-primary" />
                    Book Appointment
                </CardTitle>
                <CardDescription>Schedule a visit with one of our available specialists.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Select Doctor</Label>
                    <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                        <SelectTrigger>
                            <SelectValue placeholder={isLoadingDoctors ? 'Loading doctors...' : 'Choose a doctor'} />
                        </SelectTrigger>
                        <SelectContent>
                            {doctors?.map((doc) => (
                                <SelectItem key={doc.id} value={doc.id}>
                                    {doc.name} - {doc.specialization}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Select Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    disabled={(date) => date < new Date() || date > new Date(Date.now() + 1209600000)} // 14 days foward
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label>Select Time Slot</Label>
                        <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a slot" />
                            </SelectTrigger>
                            <SelectContent>
                                {TIME_SLOTS.map((slot) => (
                                    <SelectItem key={slot} value={slot}>
                                        {slot}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button
                    className="w-full"
                    disabled={!date || !selectedDoctorId || !selectedTimeSlot || isBooking}
                    onClick={handleBookAppointment}
                >
                    {isBooking ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Booking...
                        </>
                    ) : (
                        'Confirm Appointment'
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
