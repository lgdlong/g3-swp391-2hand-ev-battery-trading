'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  RefreshCw,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2,
  CreditCard,
  TrendingUp,
  Users,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { getAdminDashboardStatistics } from '@/lib/api/adminStatisticsApi';
import {
  getPostPaymentTotal,
  getPlatformFeeTotal,
  getTotalRevenue,
} from '@/lib/api/transactionApi';
import { PaymentOrdersTab } from './_components';

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState('overview');

  const {
    data: adminStats,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin-dashboard-statistics'],
    queryFn: getAdminDashboardStatistics,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const { data: postPaymentTotal } = useQuery({
    queryKey: ['post-payment-total'],
    queryFn: getPostPaymentTotal,
    refetchInterval: 30000,
  });

  const { data: platformFeeTotal } = useQuery({
    queryKey: ['platform-fee-total'],
    queryFn: getPlatformFeeTotal,
    refetchInterval: 30000,
  });

  const { data: totalRevenue } = useQuery({
    queryKey: ['total-revenue'],
    queryFn: getTotalRevenue,
    refetchInterval: 30000,
  });

  const financial = adminStats?.financial;

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Quản Lý Tài Chính
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi dòng tiền, giao dịch ví và lịch sử nạp tiền
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isFetching} variant="outline">
          {isFetching ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Làm mới
        </Button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng Số Dư Ví</p>
                <p className="text-2xl font-bold text-blue-500">
                  {financial ? formatCurrency(financial.totalWalletBalance) : '...'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Tất cả users</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng Tiền Nạp</p>
                <p className="text-2xl font-bold text-green-500">
                  {financial ? formatCurrency(financial.totalTopupAmount) : '...'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Qua PayOS</p>
              </div>
              <ArrowUpCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Phí Đăng Bài</p>
                <p className="text-2xl font-bold text-emerald-500">
                  {formatCurrency(postPaymentTotal || '0')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">POST_PAYMENT</p>
              </div>
              <CreditCard className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Phí Hoa Hồng</p>
                <p className="text-2xl font-bold text-purple-500">
                  {formatCurrency(platformFeeTotal || '0')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">PLATFORM_FEE (theo Fee Tier)</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Summary */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg text-muted-foreground">Tổng Doanh Thu Sàn</p>
              <p className="text-4xl font-bold text-green-500">
                {formatCurrency(totalRevenue || '0')}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                = Phí đăng bài + Phí hoa hồng (theo Fee Tier mỗi đơn hoàn thành)
              </p>
            </div>
            <DollarSign className="h-16 w-16 text-green-500/50" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            className="font-semibold h-full data-[state=active]:bg-white"
            value="overview"
          >
            Tổng Quan
          </TabsTrigger>
          <TabsTrigger className="font-semibold h-full data-[state=active]:bg-white" value="topups">
            Lịch Sử Nạp Tiền
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Transaction Type Breakdown */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Phân Loại Giao Dịch</CardTitle>
              <CardDescription>Thống kê theo loại giao dịch ví</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">WALLET_TOPUP</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Nạp tiền vào ví qua PayOS</p>
                </div>
                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowDownCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">POST_PAYMENT</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Phí đăng bài theo tier giá</p>
                </div>
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">BUY_HOLD</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Tiền treo khi mua hàng</p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">SELL_REVENUE</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Tiền seller nhận được</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">PLATFORM_FEE</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Hoa hồng theo Fee Tier về sàn</p>
                </div>
                <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpCircle className="h-4 w-4 text-cyan-500" />
                    <span className="text-sm font-medium">BUY_REFUND</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Hoàn tiền khi hủy/từ chối</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Thống Kê Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tổng giao dịch</span>
                  <span className="font-bold">
                    {financial?.totalTransactions?.toLocaleString() || '0'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Thanh Toán PayOS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Trạng thái</span>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                    Đang hoạt động
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="topups" className="mt-6">
          <PaymentOrdersTab />
        </TabsContent>
      </Tabs>
    </main>
  );
}
