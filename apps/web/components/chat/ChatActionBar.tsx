'use client';

import { Package, CheckCircle2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Conversation } from '@/types/chat';
import { Contract, initiateConfirmation } from '@/lib/api/transactionApi';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/handle-api-error';

interface ChatActionBarProps {
  conversation: Conversation;
  currentUserId: number;
  existingContract: Contract | null | undefined;
  isLoadingContract: boolean;
}

export function ChatActionBar({
  conversation,
  currentUserId,
  existingContract,
  isLoadingContract,
}: ChatActionBarProps) {
  // Mutation for Flow F: Seller initiates confirmation
  const initiateFlowFMutation = useMutation({
    mutationFn: () => {
      if (!conversation.post?.id) {
        throw new Error('Missing post ID');
      }
      return initiateConfirmation(conversation.post.id, Number.parseInt(conversation.id));
    },
    onSuccess: () => {
      toast.success('Đã gửi yêu cầu xác nhận cho người mua!');
    },
    onError: (err) => {
      handleApiError(err);
    },
  });

  // Only show for seller
  const isSeller = currentUserId === conversation.sellerId;
  if (!isSeller) {
    return null;
  }

  // If contract already exists, show status
  if (existingContract) {
    // Determine status message based on contract status (similar to BuyerActionBar)
    const statusMessage =
      existingContract.status === 'SUCCESS'
        ? 'Giao dịch đã hoàn thành'
        : 'Đã chốt đơn. Đang chờ buyer xác nhận.';

    return (
      <div className="border-b border-gray-200 bg-white px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <p className="text-sm font-medium text-green-700">{statusMessage}</p>
        </div>
      </div>
    );
  }

  // Show "Chốt đơn" button if no contract exists
  return (
    <>
      <div className="border-b border-gray-200 bg-white px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-blue-100 rounded-full">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {conversation.post?.title || 'Sản phẩm'}
              </p>
              <p className="text-xs text-gray-500">
                {conversation.post?.priceVnd
                  ? new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(parseInt(conversation.post.priceVnd))
                  : 'Chưa có giá'}
              </p>
            </div>
          </div>
          <Button
            onClick={() => initiateFlowFMutation.mutate()}
            disabled={isLoadingContract || initiateFlowFMutation.isPending}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {initiateFlowFMutation.isPending ? 'Đang xử lý...' : 'Chốt Giao Dịch'}
          </Button>
        </div>
      </div>
    </>
  );
}
