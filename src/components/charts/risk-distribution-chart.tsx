'use client';

import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = {
  Low: {
    label: 'Low',
    color: 'hsl(var(--chart-2))',
  },
  Medium: {
    label: 'Medium',
    color: 'hsl(var(--chart-4))',
  },
  Critical: {
    label: 'Critical',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

type RiskDistributionChartProps = {
  data: { name: string; value: number }[];
};

export function RiskDistributionChart({ data }: RiskDistributionChartProps) {
  return (
    <div className="h-[250px] w-full">
      <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartConfig[entry.name as keyof typeof chartConfig]?.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
