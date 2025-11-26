'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Loader2,
  AlertCircle,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import {
  getAllTransactions,
  getTotalTransactionsCount,
  type WalletTransaction,
} from '@/lib/api/walletApi';

// Service type colors and labels
const serviceTypeConfig: Record<string, { label: string; color: string; icon: 'up' | 'down' }> = {
  WALLET_TOPUP: {
    label: 'Nạp tiền',
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    icon: 'up',
  },
  POST_PAYMENT: {
    label: 'Phí đăng bài',
    color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    icon: 'down',
  },
  BUY_HOLD: {
    label: 'Tiền treo mua',
    color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    icon: 'down',
  },
  BUY_REFUND: {
    label: 'Hoàn tiền',
    color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    icon: 'up',
  },
  SELL_REVENUE: {
    label: 'Tiền bán hàng',
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    icon: 'up',
  },
  PLATFORM_FEE: {
    label: 'Hoa hồng sàn',
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    icon: 'up',
  },
  DEDUCTION: {
    label: 'Trừ tiền',
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
    icon: 'down',
  },
};

export function WalletTransactionsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const limit: number = 50;

  const {
    data: transactions,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin-all-transactions', page],
    queryFn: () => getAllTransactions(limit, page * limit),
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const { data: totalCount } = useQuery({
    queryKey: ['admin-transactions-count'],
    queryFn: getTotalTransactionsCount,
    refetchInterval: 60000,
  });

  // Filter transactions by search query
  const filteredTransactions = transactions?.filter((tx) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tx.id.toString().includes(query) ||
      tx.walletUserId.toString().includes(query) ||
      tx.description?.toLowerCase().includes(query) ||
      tx.serviceType?.code?.toLowerCase().includes(query) ||
      tx.relatedEntityId?.includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getServiceTypeDisplay = (serviceType?: { code: string; name: string }) => {
    const code = serviceType?.code || 'UNKNOWN';
    const config = serviceTypeConfig[code] || {
      label: serviceType?.name || code,
      color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      icon: 'down' as const,
    };
    return config;
  };

  const totalPages = totalCount ? Math.ceil(totalCount / limit) : 1;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Lịch Sử Giao Dịch Ví
            </CardTitle>
            <CardDescription>
              Xem tất cả giao dịch ví của users trên sàn ({totalCount?.toLocaleString() || 0} giao
              dịch)
            </CardDescription>
          </div>
          <Button onClick={() => refetch()} disabled={isFetching} variant="outline" size="sm">
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo ID, User ID, mô tả giao dịch..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 text-red-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            Không thể tải danh sách giao dịch
          </div>
        ) : !filteredTransactions?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Wallet className="h-12 w-12 mb-4" />
            <p>Không có giao dịch nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Loại giao dịch</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Liên kết</TableHead>
                    <TableHead>Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => {
                    const config = getServiceTypeDisplay(tx.serviceType);
                    const amount = Number.parseFloat(tx.amount);
                    const isPositive = config.icon === 'up';

                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-sm">#{tx.id}</TableCell>
                        <TableCell className="font-medium">{tx.walletUserId}</TableCell>
                        <TableCell>
                          <Badge className={config.color}>
                            {config.icon === 'up' ? (
                              <ArrowUpCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDownCircle className="h-3 w-3 mr-1" />
                            )}
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={
                            isPositive ? 'text-green-500 font-medium' : 'text-red-500 font-medium'
                          }
                        >
                          {isPositive ? '+' : '-'}
                          {formatCurrency(Math.abs(amount).toString())}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {tx.description || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {tx.relatedEntityType && tx.relatedEntityId ? (
                            <span className="text-muted-foreground">
                              {tx.relatedEntityType}: {tx.relatedEntityId}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(tx.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Trang {page + 1} / {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Sau
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Transaction Types Legend */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <h4 className="font-medium mb-3">Các loại giao dịch:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-green-500" />
              <span>WALLET_TOPUP - Nạp tiền</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4 text-orange-500" />
              <span>POST_PAYMENT - Phí đăng bài</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4 text-yellow-500" />
              <span>BUY_HOLD - Tiền treo mua hàng</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-green-500" />
              <span>SELL_REVENUE - Tiền bán hàng</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-purple-500" />
              <span>PLATFORM_FEE - Hoa hồng sàn</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-cyan-500" />
              <span>BUY_REFUND - Hoàn tiền</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
