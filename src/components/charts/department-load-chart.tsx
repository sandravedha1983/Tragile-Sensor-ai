'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = {
  load: {
    label: 'Patient Load',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

type DepartmentLoadChartProps = {
  data: { name: string; load: number }[];
};

export function DepartmentLoadChart({ data }: DepartmentLoadChartProps) {
  return (
    <div className="h-[250px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="load" fill="var(--color-load)" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
