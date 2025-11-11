'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, AlertCircle, RefreshCw, TrendingDown } from 'lucide-react';
import type { FraudOverview } from '@/types/admin-statistics';

interface FraudStatsCardsProps {
  fraud: FraudOverview;
  isLoading?: boolean;
}

export function FraudStatsCards({ fraud, isLoading }: FraudStatsCardsProps) {
  if (isLoading) {
    return (
      <div>
        <div className="h-7 bg-muted rounded w-48 mb-4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="bg-card border-border animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  type FraudCard = {
    title: string;
    value: string | number;
    icon: typeof AlertTriangle;
    badge: string;
    badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive';
    color: string;
  };

  const fraudCards: FraudCard[] = [
    {
      title: 'Tổng Bài Flagged Fraud',
      value: fraud.totalFraudFlags,
      icon: AlertTriangle,
      badge: 'Suspected + Confirmed',
      badgeVariant: fraud.totalFraudFlags > 0 ? 'destructive' : 'outline',
      color: 'text-red-500',
    },
    {
      title: 'Nghi Ngờ Gian Lận',
      value: fraud.suspectedCount,
      icon: AlertCircle,
      badge: 'Đang xem xét',
      badgeVariant: fraud.suspectedCount > 0 ? 'secondary' : 'outline',
      color: 'text-yellow-500',
    },
    {
      title: 'Xác Nhận Gian Lận',
      value: fraud.confirmedCount,
      icon: Shield,
      badge: 'Đã xác nhận',
      badgeVariant: fraud.confirmedCount > 0 ? 'destructive' : 'outline',
      color: 'text-red-600',
    },
    {
      title: 'Tỷ Lệ Refund',
      value: `${fraud.refundRate.toFixed(2)}%`,
      icon: TrendingDown,
      badge: 'Cancelled posts',
      badgeVariant: 'outline',
      color: 'text-orange-500',
    },
    {
      title: 'Bài Đã Refund',
      value: fraud.totalRefundedPosts,
      icon: RefreshCw,
      badge: 'Đã hoàn tiền',
      badgeVariant: 'outline',
      color: 'text-blue-500',
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-foreground">An Toàn & Gian Lận</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {fraudCards.map((card, index) => (
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
