'use client';

import { AdminResourceManager } from '@/components/admin/admin-resource-manager';
import { UserRoleManager } from '@/components/admin/user-role-manager';
import { AiConfigPanel } from '@/components/admin/ai-config-panel';
import { ComplianceLogsView, ComplianceReportsOverview } from '@/components/admin/compliance-logs-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Hospital, Cpu, ScrollText, BarChart3, Activity } from 'lucide-react';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { AiInsights } from '@/components/ai-insights';
import { useState } from 'react';
import { Patient } from '@/lib/types';

export function AdminDashboardClient({ dict }: { dict: any }) {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    return (
        <div className="container mx-auto p-4 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    {dict.page.dashboard?.welcome || 'Admin'} Control Center
                </h1>
                <p className="text-muted-foreground">Manage hospital operations, security, and AI governance.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
                <div className="lg:col-span-3">
                    <Tabs defaultValue="overview" className="space-y-4">
                        <TabsList className="bg-background/50 backdrop-blur-sm border p-1 h-auto flex-wrap">
                            <TabsTrigger value="overview" className="gap-2">
                                <BarChart3 className="w-4 h-4" /> System Overview
                            </TabsTrigger>
                            <TabsTrigger value="resources" className="gap-2">
                                <Hospital className="w-4 h-4" /> Resources
                            </TabsTrigger>
                            <TabsTrigger value="users" className="gap-2">
                                <Shield className="w-4 h-4" /> Users & Roles
                            </TabsTrigger>
                            <TabsTrigger value="ai" className="gap-2">
                                <Cpu className="w-4 h-4" /> AI Configuration
                            </TabsTrigger>
                            <TabsTrigger value="compliance" className="gap-2">
                                <ScrollText className="w-4 h-4" /> Compliance & Logs
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            <AnalyticsDashboard />
                        </TabsContent>

                        <TabsContent value="resources">
                            <AdminResourceManager />
                        </TabsContent>

                        <TabsContent value="users">
                            <UserRoleManager />
                        </TabsContent>

                        <TabsContent value="ai">
                            <AiConfigPanel />
                        </TabsContent>

                        <TabsContent value="compliance" className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <ComplianceLogsView />
                            </div>
                            <div>
                                <ComplianceReportsOverview />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
                <div className="space-y-6">
                    <Card className="rounded-2xl shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                Admin AI Oversight
                            </CardTitle>
                            <CardDescription>Monitor high-level AI diagnostic streams.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground italic">Select a patient from the system logs or analytics to see detailed AI insights here.</p>
                        </CardContent>
                    </Card>
                    <AiInsights patient={selectedPatient} />
                </div>
            </div>
        </div>
    );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
