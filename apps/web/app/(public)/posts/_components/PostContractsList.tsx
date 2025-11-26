'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getContractsByListingId, type Contract } from '@/lib/api/transactionApi';
import { ContractStatus } from '@/lib/api/transactionApi';
import { useRouter } from 'next/navigation';
import { FileText, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { relativeTime } from '@/lib/utils/format';

interface PostContractsListProps {
  listingId: string;
  sellerId: number;
  currentUserId: number | undefined;
}

export function PostContractsList({ listingId, sellerId, currentUserId }: PostContractsListProps) {
  const router = useRouter();
  
  // Only show if user is the seller
  if (!currentUserId || currentUserId !== sellerId) {
    return null;
  }

  const { data: contracts, isLoading, error } = useQuery({
    queryKey: ['contracts', 'listing', listingId],
    queryFn: () => getContractsByListingId(listingId),
    enabled: !!listingId && currentUserId === sellerId,
  });

  const getStatusBadge = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.AWAITING_CONFIRMATION:
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Chờ xác nhận
          </Badge>
        );
      case ContractStatus.SUCCESS:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Thành công
          </Badge>
        );
      case ContractStatus.FORFEITED_EXTERNAL:
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Bán ngoài hệ thống
          </Badge>
        );
      case ContractStatus.PENDING_REFUND:
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Chờ hoàn tiền
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Hợp đồng mua hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Hợp đồng mua hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Không thể tải danh sách hợp đồng</p>
        </CardContent>
      </Card>
    );
  }

  if (!contracts || contracts.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Hợp đồng mua hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Chưa có hợp đồng nào</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Hợp đồng mua hàng ({contracts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {contracts.map((contract: Contract) => (
            <div
              key={contract.id}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-900">
                    {contract.buyer?.fullName || 'Người mua'}
                  </span>
                </div>
                {getStatusBadge(contract.status)}
              </div>

              <div className="space-y-1 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>Tạo {relativeTime(contract.createdAt)}</span>
                </div>
                {contract.buyerConfirmedAt && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>Buyer xác nhận {relativeTime(contract.buyerConfirmedAt)}</span>
                  </div>
                )}
                {contract.sellerConfirmedAt && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>Seller xác nhận {relativeTime(contract.sellerConfirmedAt)}</span>
                  </div>
                )}
                {contract.confirmedAt && (
                  <div className="flex items-center gap-2 text-green-700 font-medium">
                    <CheckCircle className="h-3 w-3" />
                    <span>Hoàn tất {relativeTime(contract.confirmedAt)}</span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => router.push(`/transactions/contracts/${contract.id}`)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Xem chi tiết
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}



