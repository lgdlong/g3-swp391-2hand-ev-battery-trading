'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getDailyRevenueForMonth } from '@/lib/api/adminDashboardApi';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const monthNames = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

/**
 * Generate last 12 months options for dropdown
 */
function getAvailableMonths(): Array<{
  value: string;
  label: string;
  year: number;
  month: number;
}> {
  const months = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    months.push({
      value: `${year}-${String(month).padStart(2, '0')}`,
      label: `${monthNames[month - 1]}/${year}`,
      year,
      month,
    });
  }

  return months;
}

export function MonthlyRevenueChart() {
  // Get available months (last 12 months)
  const availableMonths = useMemo(() => getAvailableMonths(), []);

  // Set default selected month to current month
  const getDefaultMonth = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const [selectedMonth, setSelectedMonth] = useState<string>(getDefaultMonth);

  // Parse selected month to year and month
  const { year, month } = useMemo(() => {
    const parts = selectedMonth.split('-');
    return {
      year: parseInt(parts[0] || '0', 10) || new Date().getFullYear(),
      month: parseInt(parts[1] || '1', 10) || 1,
    };
  }, [selectedMonth]);

  // Fetch daily revenue for selected month
  const {
    data: revenueData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-daily-revenue', year, month],
    queryFn: () => getDailyRevenueForMonth(year, month),
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 60000, // Consider data stale after 1 minute
  });

  // Transform backend data for chart
  const dailyData = useMemo(() => {
    if (!revenueData?.dailyRevenue) return [];

    return revenueData.dailyRevenue.map((item) => ({
      ...item,
      revenueNum: Number.parseFloat(item.revenue || '0'),
    }));
  }, [revenueData]);

  // Format revenue for display
  const formatRevenue = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Phí Thu Được Theo Ngày</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Phí Thu Được Theo Ngày</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Không thể tải dữ liệu phí
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!revenueData) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Phí Thu Được Theo Ngày</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Chưa có dữ liệu phí
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedMonthLabel =
    availableMonths.find((m) => m.value === selectedMonth)?.label || 'Chọn tháng';

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5 text-primary" />
            Phí Thu Được Theo Ngày
          </CardTitle>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chọn tháng" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {dailyData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Không có dữ liệu phí cho {selectedMonthLabel}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0} // Show all labels
                tick={{ fontSize: 11 }}
                // Only show labels for days with revenue or every 3rd day
                tickFormatter={(value, index) => {
                  const dayData = dailyData[index];
                  // Show label if has revenue or every 3rd day
                  if ((dayData && dayData.revenueNum > 0) || index % 3 === 0) {
                    return value;
                  }
                  return '';
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
                  backgroundColor: '#ffff',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                }}
                formatter={(value: number) => formatRevenue(value)}
                labelFormatter={(label) => `Ngày ${label}`}
                cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenueNum"
                name="Phí Thu Được (₫)"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4, fill: '#3b82f6' }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
