'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getContractByBuyerAndListing, type Contract, ContractStatus } from '@/lib/api/transactionApi';
import { useRouter } from 'next/navigation';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { relativeTime } from '@/lib/utils/format';

interface BuyerContractInfoProps {
  listingId: string;
  buyerId: number;
  enabled: boolean;
}

export function BuyerContractInfo({ listingId, buyerId, enabled }: BuyerContractInfoProps) {
  const router = useRouter();

  const { data: contract, isLoading } = useQuery({
    queryKey: ['contract', 'buyer', 'listing', listingId],
    queryFn: () => getContractByBuyerAndListing(listingId),
    enabled: enabled && !!listingId && !!buyerId,
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

  if (!enabled) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="border border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-8 w-8 rounded" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!contract) {
    return null;
  }

  return (
    <Card className="border border-blue-200 bg-blue-50/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Hợp đồng của bạn</span>
          </div>
          {getStatusBadge(contract.status)}
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Tạo {relativeTime(contract.createdAt)}</span>
          </div>
          {contract.buyerConfirmedAt && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>Bạn đã xác nhận {relativeTime(contract.buyerConfirmedAt)}</span>
            </div>
          )}
          {contract.sellerConfirmedAt && (
            <div className="flex items-center gap-2 text-blue-600">
              <CheckCircle className="h-3 w-3" />
              <span>Người bán đã xác nhận {relativeTime(contract.sellerConfirmedAt)}</span>
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          Xem chi tiết hợp đồng
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}



