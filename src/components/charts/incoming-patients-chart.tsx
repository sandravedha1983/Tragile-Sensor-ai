'use client';

import { Line, LineChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = {
  count: {
    label: 'Patients',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

type IncomingPatientsChartProps = {
  data: { hour: string; count: number }[];
};

export function IncomingPatientsChart({ data }: IncomingPatientsChartProps) {
  return (
    <div className="h-[250px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis />
            <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="count" stroke="var(--color-count)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
