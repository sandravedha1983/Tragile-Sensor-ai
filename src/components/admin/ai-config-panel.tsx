'use client';

import { useState, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Cpu, Globe, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

export function AiConfigPanel() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const configRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'systemConfig', 'ai');
    }, [firestore]);

    const { data: config, isLoading } = useDoc<any>(configRef);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!configRef) return;

        setIsSaving(true);
        const formData = new FormData(e.currentTarget);

        const updatedConfig = {
            endpoint: formData.get('endpoint'),
            modelVersion: formData.get('modelVersion'),
            updatedAt: new Date().toISOString(),
        };

        try {
            await updateDocumentNonBlocking(configRef, updatedConfig);
            toast({
                title: 'AI Config Updated',
                description: 'AI endpoint and model configuration saved.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update configuration.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div>Loading config...</div>;

    return (
        <Card className="rounded-2xl shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Cpu className="w-6 h-6 text-primary" />
                    Configure AI Logic
                </CardTitle>
                <CardDescription>Manage AI endpoints and monitor model performance.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="endpoint" className="flex items-center gap-2">
                            <Globe className="w-4 h-4" /> AI Endpoint URL
                        </Label>
                        <Input id="endpoint" name="endpoint" placeholder="https://api.example.com/v1" defaultValue={config?.endpoint} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="modelVersion" className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" /> Model Version
                        </Label>
                        <div className="flex gap-2">
                            <Input id="modelVersion" name="modelVersion" placeholder="gpt-4o-mini-2024-07-18" defaultValue={config?.modelVersion} />
                            <Badge variant="outline" className="flex items-center px-3">Active</Badge>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 mt-2">
                        <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                            <p className="text-sm font-semibold mb-2">Fairness Metrics</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Demographic Parity</p>
                                    <p className="text-sm font-mono text-green-500">0.98 (Optimal)</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Equalized Odds</p>
                                    <p className="text-sm font-mono text-green-500">0.96 (Optimal)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSaving}>
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Updating...' : 'Apply Config'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
