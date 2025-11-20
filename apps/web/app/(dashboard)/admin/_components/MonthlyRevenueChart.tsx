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
import { getAuthHeaders } from '@/lib/auth';
import { api } from '@/lib/axios';
import type { PostPayment, PostPaymentListResponse } from '@/types/post-payment';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DailyRevenueData {
  day: string;
  date: string;
  revenue: number;
  dayNumber: number;
}

/**
 * Fetch all post payments by paginating through all pages
 */
async function fetchAllPostPayments(): Promise<PostPayment[]> {
  const allPayments: PostPayment[] = [];
  let page = 1;
  const limit = 1000; // Fetch 1000 at a time
  let total = 0;

  while (true) {
    try {
      const response = await api.get<PostPaymentListResponse>('/transactions/post-payments', {
        params: { page, limit },
        headers: getAuthHeaders(),
      });

      // Extract data from response
      // Response structure: { data: PostPayment[], total: number, page: number, limit: number }
      const responseData = response.data;
      const data = responseData?.data || [];
      const responseTotal = responseData?.total || 0;

      // Set total from first response
      if (total === 0 && responseTotal > 0) {
        total = responseTotal;
      }

      // Add all data from this page
      if (Array.isArray(data) && data.length > 0) {
        allPayments.push(...data);
      }

      // Check if we've fetched all payments
      // Stop conditions:
      // 1. No data returned
      // 2. We've collected all items based on total count
      // 3. We got less data than limit (means we're at the last page)
      if (data.length === 0) {
        break;
      }

      if (total > 0 && allPayments.length >= total) {
        break;
      }

      if (data.length < limit) {
        break;
      }

      // Move to next page
      page++;
    } catch {
      break;
    }
  }

  return allPayments;
}

/**
 * Get available months from payments data
 */
function getAvailableMonths(payments: PostPayment[]): Array<{ value: string; label: string }> {
  const monthSet = new Set<string>();

  payments.forEach((payment) => {
    const date = new Date(payment.createdAt);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    monthSet.add(monthKey);
  });

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

  return Array.from(monthSet)
    .map((monthKey) => {
      const parts = monthKey.split('-');
      const year = parts[0] || '';
      const month = parts[1] || '1';
      const monthNum = parseInt(month, 10) || 1;
      return {
        value: monthKey,
        label: `${monthNames[monthNum - 1]}/${year}`,
      };
    })
    .sort((a, b) => {
      // Sort descending (newest first)
      return b.value.localeCompare(a.value);
    });
}

/**
 * Group post payments by day in selected month and calculate revenue
 */
function calculateDailyRevenue(payments: PostPayment[], selectedMonth: string): DailyRevenueData[] {
  const parts = selectedMonth.split('-');
  const year = parseInt(parts[0] || '0', 10) || new Date().getFullYear();
  const month = parseInt(parts[1] || '1', 10) || 1;
  const daysInMonth = new Date(year, month, 0).getDate();

  // Initialize all days in month with 0 revenue
  const dailyMap = new Map<number, number>();
  for (let day = 1; day <= daysInMonth; day++) {
    dailyMap.set(day, 0);
  }

  // Filter payments for selected month and group by day
  payments.forEach((payment) => {
    // Parse date - use local time to match user's timezone
    const paymentDate = new Date(payment.createdAt);
    const paymentYear = paymentDate.getFullYear();
    const paymentMonth = paymentDate.getMonth() + 1;
    const paymentDay = paymentDate.getDate();

    // Check if payment is in selected month
    if (paymentYear === year && paymentMonth === month) {
      const amount = parseFloat(payment.amountPaid || '0') || 0;
      const currentRevenue = dailyMap.get(paymentDay) || 0;
      dailyMap.set(paymentDay, currentRevenue + amount);
    }
  });

  // Convert to array and sort by day
  const dailyData: DailyRevenueData[] = Array.from(dailyMap.entries())
    .map(([day, revenue]) => {
      return {
        day: `Ngày ${day}`,
        date: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`,
        revenue: Math.round(revenue),
        dayNumber: day,
      };
    })
    .sort((a, b) => a.dayNumber - b.dayNumber);

  return dailyData;
}

export function MonthlyRevenueChart() {
  const {
    data: payments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-monthly-revenue'],
    queryFn: fetchAllPostPayments,
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 60000, // Consider data stale after 1 minute
  });

  // Get available months from payments
  const availableMonths = useMemo(() => {
    if (!payments || payments.length === 0) return [];
    return getAvailableMonths(payments);
  }, [payments]);

  // Set default selected month to current month or latest available month
  const getDefaultMonth = (): string => {
    if (availableMonths.length > 0 && availableMonths[0]) {
      return availableMonths[0].value; // Latest month (first in sorted descending list)
    }
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const [selectedMonth, setSelectedMonth] = useState<string>(getDefaultMonth);

  // Update selected month when available months change
  useMemo(() => {
    if (
      availableMonths.length > 0 &&
      !availableMonths.find((m) => m && m.value === selectedMonth)
    ) {
      const firstMonth = availableMonths[0];
      if (firstMonth) {
        setSelectedMonth(firstMonth.value);
      }
    }
  }, [availableMonths, selectedMonth]);

  // Calculate daily revenue for selected month
  const dailyData = useMemo(() => {
    if (!payments || payments.length === 0) return [];
    return calculateDailyRevenue(payments, selectedMonth);
  }, [payments, selectedMonth]);

  // Format revenue for display
  const formatRevenue = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
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
          <CardTitle className="text-foreground">Doanh Thu Theo Ngày</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Không thể tải dữ liệu doanh thu
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Doanh Thu Theo Ngày</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Chưa có dữ liệu doanh thu
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
            Doanh Thu Theo Ngày
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
            Không có dữ liệu doanh thu cho {selectedMonthLabel}
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
                  if ((dayData && dayData.revenue > 0) || index % 3 === 0) {
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
                  backgroundColor: '#1f2937',
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
                dataKey="revenue"
                name="Doanh Thu (₫)"
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
