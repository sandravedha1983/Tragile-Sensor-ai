'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { ScrollText, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export function ComplianceLogsView() {
    const firestore = useFirestore();
    const logsRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'systemLogs'), orderBy('timestamp', 'desc'), limit(50));
    }, [firestore]);

    const { data: logs, isLoading } = useCollection<any>(logsRef);

    if (isLoading) return <div>Loading logs...</div>;

    return (
        <Card className="rounded-2xl shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <ScrollText className="w-6 h-6 text-primary" />
                    Compliance & System Logs
                </CardTitle>
                <CardDescription>Monitor system actions and regulatory compliance.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
                <div className="rounded-md border h-full overflow-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
                            <TableRow>
                                <TableHead className="w-[180px]">Timestamp</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs?.map((log: any) => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-xs font-mono">
                                        {log.timestamp ? format(new Date(log.timestamp), 'MMM dd, HH:mm:ss') : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-sm">{log.action}</TableCell>
                                    <TableCell className="text-sm">{log.userName || log.userId}</TableCell>
                                    <TableCell>
                                        <Badge variant={log.status === 'success' ? 'outline' : 'destructive'} className="flex w-fit items-center gap-1">
                                            {log.status === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                            {log.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!logs || logs.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No recent logs found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

export function ComplianceReportsOverview() {
    return (
        <Card className="rounded-2xl shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    Regulatory Reports
                </CardTitle>
                <CardDescription>Available compliance documentation.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                    <div>
                        <p className="text-sm font-medium">HIPAA Compliance Audit</p>
                        <p className="text-xs text-muted-foreground">Last generated: 2024-05-15</p>
                    </div>
                    <Badge>Valid</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                    <div>
                        <p className="text-sm font-medium">GDPR Data Processing</p>
                        <p className="text-xs text-muted-foreground">Last generated: 2024-05-10</p>
                    </div>
                    <Badge>Valid</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                    <div>
                        <p className="text-sm font-medium">AI Fairness Assessment</p>
                        <p className="text-xs text-muted-foreground">Last generated: 2024-05-20</p>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                </div>
            </CardContent>
        </Card>
    );
}
