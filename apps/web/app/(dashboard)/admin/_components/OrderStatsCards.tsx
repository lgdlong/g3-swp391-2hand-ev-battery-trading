'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Wallet,
  DollarSign,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { getOrderStats } from '@/lib/api/ordersApi';

export function OrderStatsCards() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-order-stats'],
    queryFn: getOrderStats,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  if (isLoading) {
    return (
      <div>
        <div className="h-7 bg-muted rounded w-48 mb-4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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

  if (error || !stats) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <p className="text-sm text-red-500">Không thể tải thống kê đơn hàng</p>
      </div>
    );
  }

  type OrderStatCard = {
    title: string;
    value: string | number;
    icon: typeof ShoppingCart;
    badge: string;
    badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive';
    color: string;
  };

  const orderCards: OrderStatCard[] = [
    {
      title: 'Tổng Đơn Hàng',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      badge: 'Tất cả đơn',
      badgeVariant: 'secondary',
      color: 'text-blue-500',
    },
    {
      title: 'Đơn Thành Công',
      value: stats.completedOrders.toLocaleString(),
      icon: CheckCircle,
      badge: 'COMPLETED',
      badgeVariant: 'default',
      color: 'text-green-500',
    },
    {
      title: 'Đơn Đã Hủy',
      value: stats.cancelledOrders.toLocaleString(),
      icon: XCircle,
      badge: 'CANCELLED',
      badgeVariant: 'destructive',
      color: 'text-red-500',
    },
    {
      title: 'Đang Xử Lý',
      value: (stats.processingOrders + stats.waitingConfirmOrders).toLocaleString(),
      icon: Clock,
      badge: 'PROCESSING',
      badgeVariant: 'outline',
      color: 'text-yellow-500',
    },
    {
      title: 'GMV (Tổng Giá Trị GD)',
      value: formatCurrency(stats.gmv),
      icon: TrendingUp,
      badge: 'Đơn hoàn thành',
      badgeVariant: 'default',
      color: 'text-emerald-500',
    },
    {
      title: 'Tiền Đang Tạm Giữ',
      value: formatCurrency(stats.totalEscrow),
      icon: Wallet,
      badge: 'Escrow',
      badgeVariant: 'outline',
      color: 'text-orange-500',
    },
    {
      title: 'Hoa Hồng Thu Được',
      value: formatCurrency(stats.totalCommission),
      icon: DollarSign,
      badge: 'Theo Fee Tier',
      badgeVariant: 'default',
      color: 'text-purple-500',
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-foreground">Thống Kê Đơn Hàng</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {orderCards.map((card, index) => (
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
