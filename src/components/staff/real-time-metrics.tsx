'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Activity, Users, Clock, Hospital } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function RealTimeMetrics() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-900/40 border-white/5 backdrop-blur-3xl rounded-3xl overflow-hidden relative group hover:border-risk-critical/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-risk-critical/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 flex flex-col gap-4 relative z-10">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Critical Load</span>
                        <Activity className="h-4 w-4 text-risk-critical animate-pulse shadow-[0_0_10px_#F43F5E]" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-foreground tracking-tighter uppercase whitespace-nowrap">ICU 92<span className="text-sm opacity-40 ml-1">%</span></span>
                        <span className="text-[10px] text-risk-critical font-black uppercase tracking-tight">+4.2%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-risk-critical shadow-[0_0_10px_#F43F5E]" style={{ width: '92%' }} />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-white/5 backdrop-blur-3xl rounded-3xl relative group hover:border-accent/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 flex flex-col gap-4 relative z-10">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Staff Allocation</span>
                        <Users className="h-4 w-4 text-accent shadow-[0_0_10px_#22D3EE]" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-foreground tracking-tighter uppercase">18<span className="text-sm opacity-40 ml-1">/20</span></span>
                        <span className="text-[10px] text-accent font-black uppercase tracking-tighter">Operational</span>
                    </div>
                    <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= 9 ? 'bg-accent shadow-[0_0_5px_#22D3EE]' : 'bg-white/5'}`} />
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-white/5 backdrop-blur-3xl rounded-3xl relative group hover:border-risk-accent/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-risk-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 flex flex-col gap-4 relative z-10">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Triage Flow</span>
                        <Clock className="h-4 w-4 text-risk-accent shadow-[0_0_10px_#8B5CF6]" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-foreground tracking-tighter uppercase">4.2<span className="text-sm opacity-40 ml-1">PT/H</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-risk-low font-black uppercase tracking-widest">
                        <span className="h-2 w-2 rounded-full bg-risk-low animate-pulse" />
                        Flow Nominal
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-white/5 backdrop-blur-3xl rounded-3xl shadow-2xl relative group hover:border-risk-low/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-risk-low/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 flex flex-col gap-4 relative z-10">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Bed Logistics</span>
                        <Hospital className="h-4 w-4 text-risk-low shadow-[0_0_10px_#10B981]" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-foreground tracking-tighter uppercase">12<span className="text-sm opacity-40 ml-1">UNITS</span></span>
                    </div>
                    <div className="text-[9px] text-white/30 font-bold uppercase tracking-widest leading-none bg-white/5 px-2 py-1 rounded">
                        Next Cycle: ~45m
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
