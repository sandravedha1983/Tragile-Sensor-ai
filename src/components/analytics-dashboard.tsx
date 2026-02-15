'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DepartmentLoadChart } from '@/components/charts/department-load-chart';
import { IncomingPatientsChart } from '@/components/charts/incoming-patients-chart';
import { RiskDistributionChart } from '@/components/charts/risk-distribution-chart';
import { UrgencyTrendChart } from '@/components/charts/urgency-trend-chart';
import { StatCard } from '@/components/stat-card';
import { Activity, AlertCircle, Clock, Users, Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { Patient, AnalyticsData } from '@/lib/types';

export function AnalyticsDashboard() {
    const firestore = useFirestore();

    // Optimize: Fetch only last 30 days of data to prevent lag
    const patientsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return query(
            collection(firestore, 'patients'),
            where('createdAt', '>=', thirtyDaysAgo.toISOString())
        );
    }, [firestore]);

    const { data: patients, isLoading, error } = useCollection<Patient>(patientsQuery);

    const analytics = useMemo((): AnalyticsData & { stats: any } => {
        if (!patients) return {
            riskDistribution: [],
            departmentLoad: [],
            incomingPatients: [],
            urgencyTrend: [],
            stats: { waitTime: '0 min', critical: 0, today: 0, urgency: 0 }
        };

        const now = new Date();
        const todayStr = now.toDateString();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        // Filter patients for today
        const todayPatients = patients.filter(p => new Date(p.createdAt).toDateString() === todayStr);

        // 1. Stats
        const avgWaitTime = patients.length > 0
            ? Math.round(patients.reduce((acc, p) => acc + (p.waitTime || 0), 0) / patients.length)
            : 0;
        const criticalCount = patients.filter(p => p.riskLevel === 'Critical').length;
        const avgUrgency = patients.length > 0
            ? (patients.reduce((acc, p) => acc + (p.urgencyIndex || 0), 0) / patients.length).toFixed(1)
            : '0.0';

        // 2. Risk Distribution
        const riskMap = patients.reduce((acc, p) => {
            acc[p.riskLevel] = (acc[p.riskLevel] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const riskDistribution = Object.entries(riskMap).map(([name, value]) => ({ name, value }));

        // 3. Department Load
        const deptMap = patients.reduce((acc, p) => {
            const dept = p.assignedDepartment || 'Unassigned';
            acc[dept] = (acc[dept] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const departmentLoad = Object.entries(deptMap).map(([name, load]) => ({ name, load }));

        // 4. Incoming Patients (Hourly for today)
        const hourlyMap = todayPatients.reduce((acc, p) => {
            const hour = new Date(p.createdAt).getHours();
            const hourLabel = `${hour}:00`;
            acc[hourLabel] = (acc[hourLabel] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const incomingPatients = Array.from({ length: 24 }, (_, i) => {
            const hourLabel = `${i}:00`;
            return { hour: hourLabel, count: hourlyMap[hourLabel] || 0 };
        }).filter(h => h.count > 0 || parseInt(h.hour) <= now.getHours());

        // 5. Urgency Trend (Last 7 days)
        const trendMap = patients.reduce((acc, p) => {
            const date = new Date(p.createdAt);
            if (date >= sevenDaysAgo) {
                const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                if (!acc[dateStr]) acc[dateStr] = { sum: 0, count: 0 };
                acc[dateStr].sum += p.urgencyIndex || 0;
                acc[dateStr].count += 1;
            }
            return acc;
        }, {} as Record<string, { sum: number; count: number }>);
        const urgencyTrend = Object.entries(trendMap).map(([date, data]) => ({
            date,
            avgUrgency: parseFloat((data.sum / data.count).toFixed(1))
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return {
            riskDistribution,
            departmentLoad,
            incomingPatients,
            urgencyTrend,
            stats: {
                waitTime: `${avgWaitTime} min`,
                critical: criticalCount,
                today: todayPatients.length,
                urgency: avgUrgency
            }
        };
    }, [patients]);

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground animate-pulse">Analyzing health data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 border border-destructive/20 bg-destructive/5 rounded-2xl text-center">
                <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-destructive mb-2">Failed to load analytics</h3>
                <p className="text-muted-foreground">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Avg. Wait Time"
                    value={analytics.stats.waitTime}
                    icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                    change="Real-time average"
                />
                <StatCard
                    title="Critical Cases"
                    value={analytics.stats.critical.toString()}
                    icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
                    change="Requiring immediate attention"
                    changeVariant={analytics.stats.critical > 5 ? 'negative' : 'positive'}
                />
                <StatCard
                    title="Patients Today"
                    value={analytics.stats.today.toString()}
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                    change="Active triage cases"
                />
                <StatCard
                    title="Avg. Urgency Index"
                    value={analytics.stats.urgency}
                    icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                    change="Across all departments"
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="rounded-2xl shadow-lg border-primary/10">
                    <CardHeader>
                        <CardTitle className="font-headline">Incoming Patients</CardTitle>
                        <CardDescription>Number of patients per hour today.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <IncomingPatientsChart data={analytics.incomingPatients} />
                    </CardContent>
                </Card>
                <Card className="rounded-2xl shadow-lg border-primary/10">
                    <CardHeader>
                        <CardTitle className="font-headline">Risk Distribution</CardTitle>
                        <CardDescription>Patient distribution by AI-classified risk level.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RiskDistributionChart data={analytics.riskDistribution} />
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="rounded-2xl shadow-lg border-primary/10">
                    <CardHeader>
                        <CardTitle className="font-headline">Department Load</CardTitle>
                        <CardDescription>Current patient load per department.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DepartmentLoadChart data={analytics.departmentLoad} />
                    </CardContent>
                </Card>
                <Card className="rounded-2xl shadow-lg border-primary/10">
                    <CardHeader>
                        <CardTitle className="font-headline">Avg. Urgency Trend</CardTitle>
                        <CardDescription>Average urgency index over the last 7 days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UrgencyTrendChart data={analytics.urgencyTrend} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
