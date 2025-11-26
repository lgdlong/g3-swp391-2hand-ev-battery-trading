'use client';

import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  AlertTriangle,
  FileText,
  Star,
  Phone,
} from 'lucide-react';
import { type Order, OrderStatus, SellerAction } from '@/lib/api/ordersApi';
import { useSellerConfirm, useCompleteOrder, useCancelOrder } from '@/hooks/useOrders';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface OrderCardProps {
  order: Order;
  role: 'buyer' | 'seller';
}

// Status badge config
const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  [OrderStatus.PENDING]: {
    label: 'Chờ thanh toán',
    color: 'bg-gray-100 text-gray-800',
    icon: <Clock className="h-4 w-4" />,
  },
  [OrderStatus.WAITING_SELLER_CONFIRM]: {
    label: 'Chờ xác nhận',
    color: 'bg-yellow-100 text-yellow-800',
    icon: <Clock className="h-4 w-4" />,
  },
  [OrderStatus.PROCESSING]: {
    label: 'Đang giao dịch',
    color: 'bg-blue-100 text-blue-800',
    icon: <Truck className="h-4 w-4" />,
  },
  [OrderStatus.COMPLETED]: {
    label: 'Hoàn thành',
    color: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  [OrderStatus.CANCELLED]: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-800',
    icon: <XCircle className="h-4 w-4" />,
  },
  [OrderStatus.DISPUTE]: {
    label: 'Tranh chấp',
    color: 'bg-orange-100 text-orange-800',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  [OrderStatus.REFUNDED]: {
    label: 'Đã hoàn tiền',
    color: 'bg-purple-100 text-purple-800',
    icon: <CheckCircle className="h-4 w-4" />,
  },
};

export function OrderCard({ order, role }: OrderCardProps) {
  const [rejectNote, setRejectNote] = useState('');
  const sellerConfirmMutation = useSellerConfirm();
  const completeOrderMutation = useCompleteOrder();
  const cancelOrderMutation = useCancelOrder();

  const status = statusConfig[order.status] || statusConfig[OrderStatus.PENDING];
  const postImage = order.post?.images[0]?.url || '/asset/phu-tung-o-to-27.png';

  // Handle seller accept
  const handleSellerAccept = () => {
    sellerConfirmMutation.mutate({
      orderId: order.id,
      dto: { action: SellerAction.ACCEPT },
    });
  };

  // Handle seller reject
  const handleSellerReject = () => {
    sellerConfirmMutation.mutate({
      orderId: order.id,
      dto: { action: SellerAction.REJECT, note: rejectNote || undefined },
    });
  };

  // Handle buyer complete
  const handleBuyerComplete = () => {
    completeOrderMutation.mutate(order.id);
  };

  // Handle buyer cancel
  const handleBuyerCancel = () => {
    cancelOrderMutation.mutate({ orderId: order.id });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative w-full md:w-48 h-40 md:h-auto bg-gray-50">
            <Image
              src={postImage}
              alt={order.post?.title || 'Sản phẩm'}
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Mã đơn: {order.code}</p>
                <Link
                  href={`/posts/ev/${order.postId}`}
                  className="font-semibold text-lg hover:text-[#048C73] transition-colors line-clamp-1"
                >
                  {order.post?.title || 'Không có tiêu đề'}
                </Link>
              </div>
              <Badge className={`${status.color} flex items-center gap-1`}>
                {status.icon}
                {status.label}
              </Badge>
            </div>

            {/* Price & Date */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <span className="font-bold text-orange-600 text-lg">
                {new Intl.NumberFormat('vi-VN').format(Number.parseFloat(order.amount))} ₫
              </span>
              <span>•</span>
              <span>{format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
            </div>

            {/* Counterparty Info */}
            <div className="flex items-center gap-2 text-sm mb-3">
              {role === 'buyer' ? (
                <>
                  <span className="text-gray-500">Người bán:</span>
                  <span className="font-medium">{order.seller?.fullName || 'N/A'}</span>
                  {order.status === OrderStatus.PROCESSING && order.seller?.phone && (
                    <a
                      href={`tel:${order.seller.phone}`}
                      className="flex items-center gap-1 text-[#048C73] hover:underline ml-2"
                    >
                      <Phone className="h-3 w-3" />
                      {order.seller.phone}
                    </a>
                  )}
                </>
              ) : (
                <>
                  <span className="text-gray-500">Người mua:</span>
                  <span className="font-medium">{order.buyer?.fullName || 'N/A'}</span>
                  {order.status === OrderStatus.PROCESSING && order.buyer?.phone && (
                    <a
                      href={`tel:${order.buyer.phone}`}
                      className="flex items-center gap-1 text-[#048C73] hover:underline ml-2"
                    >
                      <Phone className="h-3 w-3" />
                      {order.buyer.phone}
                    </a>
                  )}
                </>
              )}
            </div>

            {/* Commission Info for completed orders */}
            {order.status === OrderStatus.COMPLETED && role === 'seller' && (
              <div className="text-sm text-gray-600 mb-3">
                <span>Thực nhận: </span>
                <span className="font-bold text-green-600">
                  {new Intl.NumberFormat('vi-VN').format(
                    Number.parseFloat(order.sellerReceiveAmount || '0'),
                  )}{' '}
                  ₫
                </span>
                <span className="text-xs text-gray-400 ml-2">
                  (Phí:{' '}
                  {new Intl.NumberFormat('vi-VN').format(
                    Number.parseFloat(order.commissionFee || '0'),
                  )}{' '}
                  ₫)
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              {/* BUYER Actions */}
              {role === 'buyer' && (
                <>
                  {/* Waiting seller - can cancel */}
                  {order.status === OrderStatus.WAITING_SELLER_CONFIRM && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-300">
                          <XCircle className="h-4 w-4 mr-1" />
                          Hủy đơn
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận hủy đơn hàng</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc muốn hủy đơn hàng này? Tiền sẽ được hoàn lại vào ví của bạn.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Không</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleBuyerCancel}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Xác nhận hủy
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {/* Processing - can complete */}
                  {order.status === OrderStatus.PROCESSING && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700" size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Đã nhận được xe
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận đã nhận xe</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn xác nhận đã nhận được xe? Tiền sẽ được chuyển cho người bán sau khi
                            xác nhận.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleBuyerComplete}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Xác nhận đã nhận
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {/* Completed - can view contract & rate */}
                  {order.status === OrderStatus.COMPLETED && (
                    <>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/my-orders/${order.id}/contract`}>
                          <FileText className="h-4 w-4 mr-1" />
                          Xem hợp đồng
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/posts/ev/${order.postId}?rate=true`}>
                          <Star className="h-4 w-4 mr-1" />
                          Đánh giá
                        </Link>
                      </Button>
                    </>
                  )}
                </>
              )}

              {/* SELLER Actions */}
              {role === 'seller' && (
                <>
                  {/* Waiting confirmation - can accept/reject */}
                  {order.status === OrderStatus.WAITING_SELLER_CONFIRM && (
                    <>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="bg-green-600 hover:bg-green-700" size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Xác nhận bán
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận bán xe</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn đồng ý bán xe này cho người mua? Vui lòng liên hệ người mua để
                              giao xe.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleSellerAccept}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Xác nhận bán
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Từ chối
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Từ chối đơn hàng</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tiền sẽ được hoàn lại cho người mua. Vui lòng cho lý do (không bắt
                              buộc):
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <Textarea
                            placeholder="Lý do từ chối..."
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            className="my-2"
                          />
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleSellerReject}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Xác nhận từ chối
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}

                  {/* Processing - waiting for buyer to confirm */}
                  {order.status === OrderStatus.PROCESSING && (
                    <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                      Chờ người mua xác nhận đã nhận xe
                    </div>
                  )}

                  {/* Completed - view contract */}
                  {order.status === OrderStatus.COMPLETED && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/my-orders/${order.id}/contract`}>
                        <FileText className="h-4 w-4 mr-1" />
                        Xem hợp đồng
                      </Link>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
