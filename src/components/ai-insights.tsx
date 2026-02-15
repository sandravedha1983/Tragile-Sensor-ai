'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Patient } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList, Tooltip } from 'recharts';
import { Bot, AlertTriangle, BadgeCheck, FileWarning, Activity } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type AiInsightsProps = {
  patient: Patient | null;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover text-popover-foreground p-2 border rounded-lg shadow-lg">
        <p className="font-bold">{`${label} : ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

export function AiInsights({ patient }: AiInsightsProps) {
  if (!patient) {
    return (
      <Card className="bg-card/50 border-primary/20 backdrop-blur-md rounded-2xl h-full flex items-center justify-center min-h-[400px]">
        <div className="text-center p-6 space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20 shadow-inner">
            <Bot className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <div className="space-y-1">
            <p className="font-black text-xl tracking-tighter uppercase text-foreground">Awaiting Input</p>
            <p className="text-xs max-w-[200px] mx-auto text-muted-foreground font-medium uppercase tracking-widest">
              Select Patient for AI Sync
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const { confidence, topFactors, aiExplanation, modelVersion, rerouting_reason, compliance_status, fairness_warning } = patient;
  const confidencePercentage = Math.round((confidence || 0) * 100);
  const chartData = [...(topFactors || [])].sort((a, b) => b.value - a.value);

  return (
    <Card className="bg-card/50 border-primary/20 backdrop-blur-md rounded-2xl h-full flex flex-col overflow-hidden shadow-2xl">
      <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
              Clinical Intelligence
            </CardTitle>
            <CardDescription className="text-lg font-bold text-foreground tracking-tight">AI Diagnostic Overlay</CardDescription>
          </div>
          <Bot className="w-8 h-8 text-primary/40" />
        </div>
      </CardHeader>
      <CardContent className="grid gap-8 flex-1 p-6">
        {rerouting_reason && (
          <Alert variant="default" className="bg-risk-medium/10 border-risk-medium/20 text-risk-medium">
            <AlertTriangle className="h-4 w-4 !text-risk-medium" />
            <AlertTitle className="text-xs font-black uppercase tracking-widest">Protocol Override Identified</AlertTitle>
            <AlertDescription className="text-[11px] leading-relaxed opacity-80">{rerouting_reason}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-0.5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Prediction Confidence</h4>
              <p className="text-2xl font-black text-foreground tracking-tighter">{confidencePercentage}%</p>
            </div>
            <div className="flex gap-0.5 h-6 items-end">
              {[...Array(20)].map((_, i) => (
                <div key={i} className={`w-1 rounded-t-full transition-all duration-500 ${i <= (confidencePercentage / 5) ? 'bg-primary h-full' : 'bg-muted h-1/3 opacity-30'}`} />
              ))}
            </div>
          </div>
          <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${confidencePercentage}%` }} />
          </div>
        </div>

        {patient.departmentFitScores && (
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Departmental Fit Analysis</h4>
            <div className="space-y-3">
              {patient.departmentFitScores.map((dept, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-foreground/80 uppercase tracking-tight">{dept.department}</span>
                    <span className="text-primary font-black">{Math.round(dept.score * 100)}%</span>
                  </div>
                  <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60" style={{ width: `${dept.score * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 h-[200px]">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Likelihood Analysis</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ name: 'Confidence', value: confidencePercentage }, { name: 'Urgency', value: patient.urgencyIndex }]}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'hsl(var(--primary)/0.1)' }} content={<CustomTooltip />} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Top Influencing Biomarkers</h4>
          <div className="space-y-3">
            {chartData.reverse().slice(0, 3).map((factor, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-foreground/80 uppercase tracking-tight">{factor.factor}</span>
                  <span className="text-primary font-black">{factor.value}</span>
                </div>
                <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60" style={{ width: `${factor.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-primary/10">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Clinical Rationale</h4>
          <div className="text-[12px] leading-relaxed text-foreground/80 bg-slate-900/30 p-4 rounded-xl border border-primary/5 italic font-medium">
            "{aiExplanation || 'Analysis pending...'}"
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-slate-900/40 rounded-lg border border-primary/5">
            <BadgeCheck className="h-3 w-3 text-risk-low" />
            <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">V{modelVersion || '2.4'} GDX-1</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-900/40 rounded-lg border border-primary/5">
            <Activity className="h-3 w-3 text-primary" />
            <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">Compliance ID: {compliance_status || '9211'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
