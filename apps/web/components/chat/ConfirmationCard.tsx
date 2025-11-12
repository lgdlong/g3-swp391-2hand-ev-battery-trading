'use client';

import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { handleApiError } from '@/lib/handle-api-error';
import { toast } from 'sonner';
import { CheckCircle2, Clock, FileText, Loader2 } from 'lucide-react';
import { agreeToContract } from '@/lib/api/transactionApi';

interface ConfirmationCardData {
  contractId: string;
  actionParty?: 'BUYER' | 'SELLER';
  isFinal?: boolean;
  pdfUrl?: string;
  timestamp?: string;
}

interface ConfirmationCardProps {
  cardData: ConfirmationCardData | null;
  currentUserId: number;
  buyerId: number;
  sellerId: number;
}

export function ConfirmationCard({
  cardData,
  currentUserId,
  buyerId,
  sellerId,
}: ConfirmationCardProps) {
  // Mutation for buyer to agree
  const agreeMutation = useMutation({
    mutationFn: (contractId: string) => agreeToContract(contractId),
    onSuccess: () => {
      toast.success('Xác nhận giao dịch thành công!');
      // WebSocket will handle UI update via confirmation_complete event
    },
    onError: (err) => handleApiError(err),
  });

  if (!cardData) return null;

  // Stage 4: Transaction complete
  if (cardData.isFinal) {
    return (
      <div className="my-4 mx-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-900">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-lg mb-1">Giao dịch Hoàn tất!</h4>
            <p className="text-sm mb-3">
              Biên bản xác nhận đã được tạo. Cả hai bên đã đồng ý với giao dịch này.
            </p>
            {cardData.pdfUrl && (
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a href={cardData.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4" />
                  Xem Biên bản (PDF)
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Determine if current user is buyer
  const isBuyer = currentUserId === buyerId;
  const isSeller = currentUserId === sellerId;

  // Stage 2 & 3: Waiting for confirmation
  if (isBuyer) {
    // Buyer needs to take action
    return (
      <div className="my-4 mx-4 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-900">
        <div className="flex items-start gap-3">
          <Clock className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-lg mb-1">Người bán đã xác nhận!</h4>
            <p className="text-sm mb-3">
              Vui lòng xác nhận nếu bạn đã nhận hàng và đồng ý hoàn tất giao dịch. Sau khi xác nhận,
              giao dịch sẽ không thể hoàn tác.
            </p>
            <Button
              onClick={() => agreeMutation.mutate(cardData.contractId)}
              disabled={agreeMutation.isPending}
              className="gap-2"
            >
              {agreeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Tôi Đồng ý Giao dịch
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isSeller) {
    // Seller is waiting
    return (
      <div className="my-4 mx-4 p-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-700">
        <div className="flex items-start gap-3">
          <Clock className="h-6 w-6 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-lg mb-1">Đang chờ xác nhận...</h4>
            <p className="text-sm">
              Đã gửi yêu cầu xác nhận cho người mua. Vui lòng đợi người mua xác nhận đã nhận hàng.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
