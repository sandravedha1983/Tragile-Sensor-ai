'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Patient } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { ArrowUpDown, ListFilter } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from './ui/dropdown-menu';
import { ScrollArea } from './ui/scroll-area';

type LiveTriageQueueProps = {
  patients: Patient[];
  onPatientSelect: (patient: Patient) => void;
  selectedPatientId?: string;
};

const riskColorMap = {
  Critical: 'bg-risk-critical/10 text-risk-critical border-risk-critical/30',
  Medium: 'bg-risk-medium/10 text-risk-medium border-risk-medium/30',
  Low: 'bg-risk-low/10 text-risk-low border-risk-low/30',
};

export function LiveTriageQueue({ patients, onPatientSelect, selectedPatientId }: LiveTriageQueueProps) {
  const sortedPatients = [...patients].sort((a, b) => b.urgencyIndex - a.urgencyIndex);

  return (
    <Card className="bg-card/40 border-primary/10 backdrop-blur-md rounded-2xl shadow-2xl h-full flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-primary/5 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary">Live Operations</CardTitle>
          <CardDescription className="text-lg font-bold text-foreground tracking-tight">Active Triage Queue</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/20 px-2 py-1 rounded border border-primary/5">
            Total: {patients.length}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className='h-8 border-primary/20 bg-primary/5 hover:bg-primary/10 text-xs font-bold uppercase tracking-widest'>
                <ListFilter className="h-3.5 w-3.5 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-primary/10">
              <DropdownMenuCheckboxItem checked>Critical Priority</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Standard Flow</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Observation</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-[500px] xl:h-[calc(100vh-22rem)]">
          <Table>
            <TableHeader className='bg-primary/5 sticky top-0 z-10 backdrop-blur-lg'>
              <TableRow className="border-primary/5 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Patient Profile</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">
                  <Button variant="ghost" className="h-auto p-0 hover:bg-transparent text-[10px] font-black uppercase tracking-widest">
                    Urgency Index
                    <ArrowUpDown className="ml-2 h-3 w-3 text-primary" />
                  </Button>
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Clinical Unit</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 text-right pr-6">Wait Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPatients.map((patient) => (
                <TableRow
                  key={patient.id}
                  onClick={() => onPatientSelect(patient)}
                  className={cn(
                    'cursor-pointer border-primary/5 transition-all duration-300 group',
                    patient.id === selectedPatientId
                      ? 'bg-primary/10 border-l-2 border-l-primary'
                      : 'hover:bg-primary/5'
                  )}
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10 ring-2 ring-primary/5 border border-primary/10">
                          <AvatarImage src={patient.avatarUrl} alt="Avatar" />
                          <AvatarFallback className="bg-slate-900 text-primary font-black">{patient.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${patient.riskLevel === 'Critical' ? 'bg-risk-critical' :
                            patient.riskLevel === 'Medium' ? 'bg-risk-medium' : 'bg-risk-low'
                          }`} />
                      </div>
                      <div className='grid gap-0.5'>
                        <p className='font-bold text-sm tracking-tight text-foreground/90'>{patient.name}</p>
                        <p className='text-[10px] text-muted-foreground font-black uppercase tracking-wider opacity-60'>{patient.age}Y • {patient.gender}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center h-10 w-10 rounded-lg bg-slate-900/50 border border-primary/10 shadow-inner">
                        <span className="text-sm font-black text-primary leading-none">{patient.urgencyIndex}</span>
                        <span className="text-[7px] font-black uppercase text-muted-foreground opacity-50">Score</span>
                      </div>
                      <Badge variant="outline" className={cn(
                        'text-[9px] font-black uppercase tracking-[0.1em] h-5 ring-offset-0',
                        riskColorMap[patient.riskLevel]
                      )}>
                        {patient.riskLevel}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                      <span className="text-xs font-bold text-foreground/70 uppercase tracking-tighter">{patient.assignedDepartment}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-3">
                      <div className="flex flex-col items-end">
                        <span className={cn(
                          "text-sm font-black tracking-tighter",
                          patient.waitTime > 30 ? "text-risk-critical" : "text-foreground/90"
                        )}>{patient.waitTime} MIN</span>
                        <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest opacity-40 italic">Elapsed</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newUrgency = prompt('Manual Urgency Override (0-100):', patient.urgencyIndex.toString());
                          if (newUrgency && !isNaN(parseInt(newUrgency))) {
                            (window as any).handlePriorityOverride?.(patient.id, parseInt(newUrgency));
                          }
                        }}
                      >
                        <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
