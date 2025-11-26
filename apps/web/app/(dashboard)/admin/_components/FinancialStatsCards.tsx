'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, DollarSign, TrendingUp, ArrowUpCircle, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import {
  getPostPaymentTotal,
  getPlatformFeeTotal,
  getTotalRevenue,
} from '@/lib/api/transactionApi';
import type { FinancialOverview } from '@/types/admin-statistics';

interface FinancialStatsCardsProps {
  financial: FinancialOverview;
  isLoading?: boolean;
}

export function FinancialStatsCards({ financial, isLoading }: FinancialStatsCardsProps) {
  const { data: postPaymentTotal, isLoading: postPaymentLoading } = useQuery({
    queryKey: ['post-payment-total'],
    queryFn: getPostPaymentTotal,
    refetchInterval: 30000,
  });

  const { data: platformFeeTotal, isLoading: platformFeeLoading } = useQuery({
    queryKey: ['platform-fee-total'],
    queryFn: getPlatformFeeTotal,
    refetchInterval: 30000,
  });

  const { data: totalRevenue, isLoading: revenueLoading } = useQuery({
    queryKey: ['total-revenue'],
    queryFn: getTotalRevenue,
    refetchInterval: 30000,
  });

  const isDataLoading =
    isLoading || postPaymentLoading || platformFeeLoading || revenueLoading;

  if (isDataLoading) {
    return (
      <div>
        <div className="h-7 bg-muted rounded w-48 mb-4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-card border-border animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-24 mb-2"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  type FinancialCard = {
    title: string;
    value: string;
    icon: typeof Wallet;
    badge: string;
    badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive';
    color: string;
  };

  const financialCards: FinancialCard[] = [
    {
      title: 'Tổng Số Dư Ví',
      value: formatCurrency(financial.totalWalletBalance),
      icon: Wallet,
      badge: 'Tất cả users',
      badgeVariant: 'secondary',
      color: 'text-blue-500',
    },
    {
      title: 'Tổng Tiền Nạp',
      value: formatCurrency(financial.totalTopupAmount),
      icon: ArrowUpCircle,
      badge: 'Qua PayOS',
      badgeVariant: 'outline',
      color: 'text-green-500',
    },
    {
      title: 'Số Giao Dịch',
      value: financial.totalTransactions.toLocaleString(),
      icon: CreditCard,
      badge: 'Tổng transactions',
      badgeVariant: 'secondary',
      color: 'text-purple-500',
    },
    {
      title: 'Tổng Phí Đăng Bài',
      value: formatCurrency(postPaymentTotal || '0'),
      icon: DollarSign,
      badge: 'POST_PAYMENT',
      badgeVariant: 'default',
      color: 'text-emerald-500',
    },
    {
      title: 'Tổng Phí Hoa Hồng',
      value: formatCurrency(platformFeeTotal || '0'),
      icon: DollarSign,
      badge: 'PLATFORM_FEE',
      badgeVariant: 'default',
      color: 'text-cyan-500',
    },
    {
      title: 'Tổng Doanh Thu',
      value: formatCurrency(totalRevenue || '0'),
      icon: TrendingUp,
      badge: 'Tổng thu được',
      badgeVariant: 'default',
      color: 'text-green-600',
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-foreground">Thông Tin Tài Chính</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {financialCards.map((card, index) => (
          <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={card.badgeVariant} className="text-xs">
                  {card.badge}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
