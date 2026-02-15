'use client';

import { HospitalResourcesView } from '@/components/hospital-resources-view';

export default function ResourcesPage() {
    return (
        <div className="container mx-auto p-4 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Hospital Resources</h1>
                <p className="text-muted-foreground">Monitor real-time availability of staff and facilities.</p>
            </div>
            <div className="max-w-4xl">
                <HospitalResourcesView />
            </div>
        </div>
    );
}
