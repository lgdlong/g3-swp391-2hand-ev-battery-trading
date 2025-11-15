'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Package,
  User,
  FileText,
  AlertTriangle,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { getContract, ContractStatus } from '@/lib/api/transactionApi';
import { ContractConfirmationDialog } from './_components/ContractConfirmationDialog';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const contractId = params?.id as string;
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const {
    data: contract,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['contract', contractId],
    queryFn: () => getContract(contractId),
    enabled: !!contractId,
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa xác nhận';
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getStatusConfig = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.AWAITING_CONFIRMATION:
        return {
          label: 'Chờ xác nhận',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
        };
      case ContractStatus.SUCCESS:
        return {
          label: 'Thành công',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle2,
        };
      case ContractStatus.FORFEITED_EXTERNAL:
        return {
          label: 'Bán ngoài hệ thống',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: XCircle,
        };
      case ContractStatus.PENDING_REFUND:
        return {
          label: 'Chờ hoàn tiền',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: AlertTriangle,
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="relative bg-[#1a2332] text-white overflow-hidden">
          <div className="relative container mx-auto px-4 py-12">
            <Skeleton className="h-8 w-64 bg-white/20" />
          </div>
        </section>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Không tìm thấy hợp đồng</h2>
              <p className="text-gray-600 mb-4">
                {error ? 'Có lỗi xảy ra khi tải dữ liệu' : 'Hợp đồng không tồn tại hoặc bạn không có quyền xem'}
              </p>
              <Button onClick={() => router.back()}>Quay lại</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isBuyer = user?.id === contract.buyerId;
  const isSeller = user?.id === contract.sellerId;
  const statusConfig = getStatusConfig(contract.status);
  const StatusIcon = statusConfig.icon;

  // Buyer needs to confirm receipt after seller confirms order
  const canConfirmBuyer = isBuyer && !contract.buyerConfirmedAt && contract.status === ContractStatus.AWAITING_CONFIRMATION;
  const canConfirmSeller = isSeller && !contract.sellerConfirmedAt;
  const canForfeitSeller = isSeller && contract.status === ContractStatus.AWAITING_CONFIRMATION;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="relative bg-[#1a2332] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332] via-[#233447] to-[#1a2332] opacity-50"></div>
        <div className="relative container mx-auto px-4 py-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-6 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Chi tiết hợp đồng</h1>
              <p className="text-gray-300">ID: {contract.id}</p>
            </div>
            <Badge className={`${statusConfig.color} border text-sm px-4 py-2`}>
              <StatusIcon className="h-4 w-4 mr-2" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Contract Info */}
          <div className="space-y-6">
            {/* Contract Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Trạng thái hợp đồng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Trạng thái:</span>
                  <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                </div>
                {contract.isExternalTransaction && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Giao dịch ngoài:</span>
                    <Badge className="bg-orange-100 text-orange-800">Có</Badge>
                  </div>
                )}
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Người mua xác nhận:</span>
                    <span className={contract.buyerConfirmedAt ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {contract.buyerConfirmedAt ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          Đã xác nhận
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Chờ xác nhận
                        </span>
                      )}
                    </span>
                  </div>
                  {contract.buyerConfirmedAt && (
                    <p className="text-xs text-gray-500">{formatDate(contract.buyerConfirmedAt)}</p>
                  )}
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Người bán xác nhận:</span>
                    <span className={contract.sellerConfirmedAt ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {contract.sellerConfirmedAt ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          Đã xác nhận
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Chờ xác nhận
                        </span>
                      )}
                    </span>
                  </div>
                  {contract.sellerConfirmedAt && (
                    <p className="text-xs text-gray-500">{formatDate(contract.sellerConfirmedAt)}</p>
                  )}
                </div>
                {contract.confirmedAt && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Cả hai đã xác nhận:</span>
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          {formatDate(contract.confirmedAt)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Participants Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Người tham gia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Người mua</span>
                  </div>
                  {contract.buyer ? (
                    <div className="pl-6">
                      <p className="font-medium">{contract.buyer.fullName}</p>
                      {contract.buyer.email && <p className="text-sm text-gray-600">{contract.buyer.email}</p>}
                      {contract.buyer.phone && <p className="text-sm text-gray-600">{contract.buyer.phone}</p>}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 pl-6">ID: {contract.buyerId}</p>
                  )}
                </div>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Người bán</span>
                  </div>
                  {contract.seller ? (
                    <div className="pl-6">
                      <p className="font-medium">{contract.seller.fullName}</p>
                      {contract.seller.email && <p className="text-sm text-gray-600">{contract.seller.email}</p>}
                      {contract.seller.phone && <p className="text-sm text-gray-600">{contract.seller.phone}</p>}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 pl-6">ID: {contract.sellerId}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions & Info */}
          <div className="space-y-6">
            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Hành động
                </CardTitle>
                <CardDescription>
                  {isBuyer
                    ? 'Xác nhận đã nhận hàng hoặc xem lại thông tin sản phẩm'
                    : 'Xác nhận bạn đã giao hàng hoặc xem lại thông tin sản phẩm'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Confirm Actions */}
                {(canConfirmBuyer || canConfirmSeller) && (
                  <Button
                    onClick={() => setIsConfirmDialogOpen(true)}
                    className="w-full"
                    size="lg"
                    variant={isBuyer ? 'default' : 'default'}
                    style={isBuyer ? { backgroundColor: '#2563eb' } : { backgroundColor: '#16a34a' }}
                  >
                    {isBuyer ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Xác nhận đã nhận hàng
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Xác nhận đã giao hàng
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Contract Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Thông tin hợp đồng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID hợp đồng:</span>
                  <span className="font-mono">{contract.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ID bài đăng:</span>
                  <span className="font-mono">{contract.listingId}</span>
                </div>
                {contract.feeRate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tỷ lệ phí:</span>
                    <span>{contract.feeRate}%</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày tạo:</span>
                  <span>{formatDate(contract.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cập nhật lần cuối:</span>
                  <span>{formatDate(contract.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {user && (
        <ContractConfirmationDialog
          contract={contract}
          currentUserId={user.id}
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          onSuccess={() => {
            // Contract will be refetched automatically via query invalidation
          }}
        />
      )}
    </div>
  );
}

