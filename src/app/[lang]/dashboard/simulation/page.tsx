'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SimulationPage() {
    return (
        <div className="container mx-auto p-4 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">AI Simulations</h1>
                <p className="text-muted-foreground">Run emergency scenarios to test hospital readiness.</p>
            </div>

            <Card className="max-w-2xl rounded-2xl shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-primary" />
                        Mass Casualty Event
                    </CardTitle>
                    <CardDescription>Simulate 50+ incoming patients with varying urgency levels.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full gap-2">
                        <Play className="w-4 h-4" /> Start Simulation
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
