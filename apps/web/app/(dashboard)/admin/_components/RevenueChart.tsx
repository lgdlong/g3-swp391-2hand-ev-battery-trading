'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getMonthlyRevenue } from '@/lib/api/transactionApi';
import { formatCurrency } from '@/lib/utils/format';

export function RevenueChart() {
  const { data: monthlyData, isLoading } = useQuery({
    queryKey: ['monthly-revenue'],
    queryFn: getMonthlyRevenue,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const chartData =
    monthlyData?.map((item) => ({
      month: item.month,
      revenue: Number.parseFloat(item.revenue || '0'),
    })) || [];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Tổng Doanh Thu Theo Tháng</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="month"
              stroke="#9ca3af"
              tickFormatter={(value) => {
                const [year, month] = value.split('-');
                return `${month}/${year}`;
              }}
            />
            <YAxis
              stroke="#9ca3af"
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`;
                }
                if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)}K`;
                }
                return value.toString();
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '6px',
              }}
              labelStyle={{ color: '#f9fafb' }}
              formatter={(value: number) => formatCurrency(value.toString())}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Doanh Thu"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
