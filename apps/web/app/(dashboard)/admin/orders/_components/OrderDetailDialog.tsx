'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Package,
  Calendar,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { type Order, OrderStatus } from '@/lib/api/ordersApi';

interface OrderDetailDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Chờ xử lý',
  [OrderStatus.WAITING_SELLER_CONFIRM]: 'Chờ Seller xác nhận',
  [OrderStatus.PROCESSING]: 'Đang giao hàng',
  [OrderStatus.COMPLETED]: 'Hoàn thành',
  [OrderStatus.CANCELLED]: 'Đã hủy',
  [OrderStatus.REFUNDED]: 'Đã hoàn tiền',
};

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  [OrderStatus.WAITING_SELLER_CONFIRM]: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  [OrderStatus.PROCESSING]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  [OrderStatus.COMPLETED]: 'bg-green-500/10 text-green-400 border-green-500/20',
  [OrderStatus.CANCELLED]: 'bg-red-500/10 text-red-400 border-red-500/20',
  [OrderStatus.REFUNDED]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export function OrderDetailDialog({ order, open, onOpenChange }: OrderDetailDialogProps) {
  if (!order) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Chi Tiết Đơn Hàng
          </DialogTitle>
          <DialogDescription>
            Mã đơn: <span className="font-mono font-medium">{order.code}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Trạng thái</span>
            <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
          </div>

          <Separator />

          {/* Buyer Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                Thông Tin Người Mua
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Họ tên:</span>
                <span className="font-medium">{order.buyer?.fullName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{order.buyer?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số điện thoại:</span>
                <span>{order.buyer?.phone || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-green-500" />
                Thông Tin Người Bán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Họ tên:</span>
                <span className="font-medium">{order.seller?.fullName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{order.seller?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số điện thoại:</span>
                <span>{order.seller?.phone || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Financial Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-500" />
                Thông Tin Tài Chính
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Giá trị đơn hàng:</span>
                <span className="font-bold text-lg">{formatCurrency(order.amount)}</span>
              </div>
              {order.commissionFee && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí hoa hồng (theo Fee Tier):</span>
                  <span className="text-red-500">{formatCurrency(order.commissionFee)}</span>
                </div>
              )}
              {order.sellerReceiveAmount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seller nhận được:</span>
                  <span className="text-green-500 font-medium">
                    {formatCurrency(order.sellerReceiveAmount)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                Thời Gian
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày tạo:</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              {order.confirmedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày xác nhận:</span>
                  <span>{formatDate(order.confirmedAt)}</span>
                </div>
              )}
              {order.completedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày hoàn thành:</span>
                  <span className="text-green-500">{formatDate(order.completedAt)}</span>
                </div>
              )}
              {order.cancelledAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày hủy:</span>
                  <span className="text-red-500">{formatDate(order.cancelledAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Note */}
          {order.note && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-500" />
                  Ghi Chú
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.note}</p>
              </CardContent>
            </Card>
          )}

          {/* Post Info */}
          {order.post && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4 text-cyan-500" />
                  Thông Tin Bài Đăng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tiêu đề:</span>
                  <span className="font-medium">{order.post.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loại:</span>
                  <Badge variant="outline">{order.post.postType}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giá:</span>
                  <span>{formatCurrency(order.post.priceVnd)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
