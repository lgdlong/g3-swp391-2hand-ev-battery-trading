import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { relativeTime } from '@/lib/utils/format';
import Link from 'next/link';
import type { Contract } from '@/lib/api/transactionApi';
import { ContractStatus } from '@/lib/api/transactionApi';

interface ContractCardProps {
  contract: Contract;
}

function formatPrice(price: string | number | null | undefined): string {
  if (!price) return 'N/A';
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(num);
}

function getStatusBadge(status: ContractStatus) {
  switch (status) {
    case ContractStatus.AWAITING_CONFIRMATION:
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Đang giao
        </Badge>
      );
    case ContractStatus.SUCCESS:
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Đã giao
        </Badge>
      );
    case ContractStatus.FORFEITED_EXTERNAL:
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Đã hủy
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
}

export function ContractCard({ contract }: ContractCardProps) {
  const otherParty = contract.seller;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">
              {contract.listingSnapshot?.title || 'Sản phẩm không xác định'}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  Người bán: <span className="font-semibold text-foreground">{otherParty?.fullName || 'N/A'}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>
                  Giá trị: <span className="font-semibold text-foreground">{formatPrice(contract.listingSnapshot?.priceVnd)}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(contract.status)}
            <span className="text-xs text-muted-foreground">{relativeTime(contract.createdAt)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {contract.sellerConfirmedAt && (
              <p>Người bán đã chốt đơn: {relativeTime(contract.sellerConfirmedAt)}</p>
            )}
            {contract.buyerConfirmedAt && (
              <p>Bạn đã xác nhận đã nhận hàng: {relativeTime(contract.buyerConfirmedAt)}</p>
            )}
            {contract.confirmedAt && (
              <p className="text-green-600 font-semibold">Hoàn thành: {relativeTime(contract.confirmedAt)}</p>
            )}
          </div>
          <div className="flex gap-2">
            {contract.status === ContractStatus.AWAITING_CONFIRMATION && !contract.buyerConfirmedAt && (
              <Button asChild>
                <Link href={`/transactions/contracts/${contract.id}`}>Xác nhận đã nhận hàng</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href={`/transactions/contracts/${contract.id}`}>Xem chi tiết</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

