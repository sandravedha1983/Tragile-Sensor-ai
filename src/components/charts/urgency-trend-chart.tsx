'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = {
  avgUrgency: {
    label: 'Avg. Urgency',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

type UrgencyTrendChartProps = {
  data: { date: string; avgUrgency: number }[];
};

export function UrgencyTrendChart({ data }: UrgencyTrendChartProps) {
  return (
    <div className="h-[250px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
                <linearGradient id="fillAvgUrgency" x1="0" y1="0" x2="0" y2="1">
                    <stop
                    offset="5%"
                    stopColor="var(--color-avgUrgency)"
                    stopOpacity={0.8}
                    />
                    <stop
                    offset="95%"
                    stopColor="var(--color-avgUrgency)"
                    stopOpacity={0.1}
                    />
                </linearGradient>
            </defs>
            <Area
              dataKey="avgUrgency"
              type="natural"
              fill="url(#fillAvgUrgency)"
              fillOpacity={0.4}
              stroke="var(--color-avgUrgency)"
              stackId="a"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
