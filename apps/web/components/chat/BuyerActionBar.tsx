'use client';

import { CheckCircle2, Package, AlertCircle, ExternalLink } from 'lucide-react';
import { Conversation } from '@/types/chat';
import { Contract, ContractStatus } from '@/lib/api/transactionApi';
import Link from 'next/link';

interface BuyerActionBarProps {
  conversation: Conversation;
  currentUserId: number;
  existingContract: Contract | null | undefined;
  isLoadingContract: boolean;
}

export function BuyerActionBar({
  conversation,
  currentUserId,
  existingContract,
  isLoadingContract,
}: BuyerActionBarProps) {
  // Only show for buyer
  const isBuyer = currentUserId === conversation.buyerId;
  if (!isBuyer) {
    return null;
  }

  // If no contract exists, don't show anything
  if (!existingContract) {
    return null;
  }

  // If contract exists, show status only (no confirm button in chat)
  const getStatusDisplay = () => {
    switch (existingContract.status) {
      case ContractStatus.AWAITING_CONFIRMATION:
        return {
          text: 'ĐANG GIAO HÀNG. Vui lòng vào "Quản lý đơn hàng" để xác nhận đã nhận hàng.',
          icon: Package,
          variant: 'default' as const,
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        };
      case ContractStatus.SUCCESS:
        return {
          text: 'Giao dịch đã hoàn thành',
          icon: CheckCircle2,
          variant: 'default' as const,
          className: 'bg-green-50 text-green-700 border-green-200',
        };
      case ContractStatus.FORFEITED_EXTERNAL:
        return {
          text: 'Đã hủy - Bán ngoài hệ thống',
          icon: AlertCircle,
          variant: 'destructive' as const,
          className: 'bg-red-50 text-red-700 border-red-200',
        };
      case ContractStatus.PENDING_REFUND:
        return {
          text: 'Chờ hoàn tiền',
          icon: AlertCircle,
          variant: 'default' as const,
          className: 'bg-orange-50 text-orange-700 border-orange-200',
        };
      default:
        return {
          text: 'Đang xử lý...',
          icon: Package,
          variant: 'default' as const,
          className: 'bg-gray-50 text-gray-700 border-gray-200',
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3 flex-shrink-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <StatusIcon className="h-4 w-4" />
          <p className="text-sm font-medium">{statusDisplay.text}</p>
        </div>
        {existingContract && (
          <Link
            href={`/transactions/contracts/${existingContract.id}`}
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
          >
            Xem chi tiết
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

