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
import { Search, CreditCard, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import {
  getAllPaymentOrders,
  getTotalPaymentOrdersCount,
  type PaymentOrder,
} from '@/lib/api/walletApi';

// Chỉ còn 2 trạng thái: CHỜ THANH TOÁN và HOÀN TẤT
const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ thanh toán', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  COMPLETE: { label: 'Hoàn tất', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
};

export function PaymentOrdersTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const limit = 50;

  const {
    data: paymentOrders,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin-all-payment-orders', page],
    queryFn: () => getAllPaymentOrders(limit, page * limit),
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const { data: totalCount } = useQuery({
    queryKey: ['admin-payment-orders-count'],
    queryFn: getTotalPaymentOrdersCount,
    refetchInterval: 60000,
  });

  // Filter payment orders by search query
  const filteredOrders = paymentOrders?.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.id.toString().includes(query) ||
      order.orderCode?.includes(query) ||
      order.accountId.toString().includes(query) ||
      order.account?.fullName?.toLowerCase().includes(query) ||
      order.account?.email?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Chuyển đổi status backend sang 2 trạng thái duy nhất
  const getStatusDisplay = (status: string) => {
    if (status === 'PENDING') return statusConfig.PENDING;
    // Các trạng thái còn lại đều coi là COMPLETE
    return statusConfig.COMPLETE;
  };

  const totalPages = totalCount ? Math.ceil(totalCount / limit) : 1;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Lịch Sử Nạp Tiền (PayOS)
            </CardTitle>
            <CardDescription>
              Xem tất cả giao dịch nạp tiền qua PayOS để đối soát (
              {totalCount?.toLocaleString() || 0} giao dịch)
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
            placeholder="Tìm theo mã giao dịch, User ID, tên, email..."
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
            Không thể tải danh sách payment orders
          </div>
        ) : !filteredOrders?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <CreditCard className="h-12 w-12 mb-4" />
            <p>Không có payment order nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Mã giao dịch</TableHead>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Dịch vụ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Mã tham chiếu</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Ngày hoàn tất</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const statusDisplay = getStatusDisplay(order.status);

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">#{order.id}</TableCell>
                        <TableCell className="font-mono font-medium">
                          {order.orderCode || '-'}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {order.account?.fullName || `Người dùng #${order.accountId}`}
                            </p>
                            <p className="text-xs text-muted-foreground">{order.account?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-green-500">
                          {formatCurrency(order.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {order.serviceType?.name || order.serviceType?.code || 'Không rõ'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.status === 'PENDING' ? (
                            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                              {statusDisplay?.label}
                            </Badge>
                          ) : (
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                              {statusDisplay?.label}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                          {order.paymentRef || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(order.paidAt)}
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

        {/* Chú thích trạng thái */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <h4 className="font-medium mb-3">Chú thích trạng thái:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Chờ thanh toán</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Hoàn tất</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
