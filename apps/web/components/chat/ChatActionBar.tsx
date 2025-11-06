'use client';

import { useState } from 'react';
import { Package, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Conversation } from '@/types/chat';
import { Contract } from '@/lib/api/transactionApi';
import { ConfirmOrderDialog } from './ConfirmOrderDialog';

interface ChatActionBarProps {
  conversation: Conversation;
  currentUserId: number;
  existingContract: Contract | null | undefined;
  isLoadingContract: boolean;
  onContractCreated: () => void;
}

export function ChatActionBar({
  conversation,
  currentUserId,
  existingContract,
  isLoadingContract,
  onContractCreated,
}: ChatActionBarProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Only show for seller
  const isSeller = currentUserId === conversation.sellerId;
  if (!isSeller) {
    return null;
  }

  // If contract already exists, show status
  if (existingContract) {
    return (
      <div className="border-b border-gray-200 bg-white px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <p className="text-sm font-medium text-green-700">
            Đã chốt đơn. Đang chờ buyer xác nhận.
          </p>
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
            onClick={() => setIsDialogOpen(true)}
            disabled={isLoadingContract}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Package className="h-4 w-4 mr-2" />
            Chốt đơn
          </Button>
        </div>
      </div>

      <ConfirmOrderDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        conversation={conversation}
        onConfirm={onContractCreated}
      />
    </>
  );
}
