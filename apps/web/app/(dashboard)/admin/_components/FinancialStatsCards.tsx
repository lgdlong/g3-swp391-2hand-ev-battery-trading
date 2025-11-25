'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, DollarSign, CreditCard, ShieldCheck, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import type { FinancialOverview } from '@/types/admin-statistics';

interface FinancialStatsCardsProps {
  financial: FinancialOverview;
  isLoading?: boolean;
}

export function FinancialStatsCards({ financial, isLoading }: FinancialStatsCardsProps) {
  if (isLoading) {
    return (
      <div>
        <div className="h-7 bg-muted rounded w-48 mb-4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
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
      title: 'Tổng Tiền Rút',
      value: formatCurrency(financial.totalWithdrawalAmount),
      icon: ArrowDownCircle,
      badge: 'Chưa hỗ trợ',
      badgeVariant: 'outline',
      color: 'text-orange-500',
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
      title: 'Tổng Phí Thu Được',
      value: formatCurrency(financial.totalFeesCollected),
      icon: DollarSign,
      badge: 'Phí đăng bài',
      badgeVariant: 'default',
      color: 'text-emerald-500',
    },
    {
      title: 'Tiền Cọc Thu Được',
      value: formatCurrency(financial.totalDepositCollected),
      icon: ShieldCheck,
      badge: 'Post deposits',
      badgeVariant: 'outline',
      color: 'text-cyan-500',
    },
    {
      title: 'Doanh Thu Ròng',
      value: formatCurrency(financial.netRevenue),
      icon: TrendingUp,
      badge: 'Sau refund',
      badgeVariant: 'default',
      color: 'text-green-600',
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-foreground">Thông Tin Tài Chính</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
