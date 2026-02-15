import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changeVariant?: 'default' | 'positive' | 'negative';
};

export function StatCard({ title, value, icon, change, changeVariant = 'default' }: StatCardProps) {
  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p
            className={cn('text-xs text-muted-foreground', {
              'text-green-500': changeVariant === 'positive',
              'text-red-500': changeVariant === 'negative',
            })}
          >
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
