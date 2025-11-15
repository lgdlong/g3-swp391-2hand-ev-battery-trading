'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Package, CheckCircle2, Store, ExternalLink } from 'lucide-react';
import { Conversation } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ConfirmOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
  onConfirm: (isExternalTransaction: boolean) => void;
}

export function ConfirmOrderDialog({
  isOpen,
  onClose,
  conversation,
  onConfirm,
}: ConfirmOrderDialogProps) {
  const [transactionType, setTransactionType] = useState<'internal' | 'external'>('internal');
  const post = conversation.post;
  const price = post?.priceVnd
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(parseInt(post.priceVnd))
    : 'Chưa có giá';

  const handleConfirm = () => {
    onConfirm(transactionType === 'external');
    onClose();
    // Reset to default when closing
    setTransactionType('internal');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      // Reset to default when closing
      setTransactionType('internal');
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <AlertDialogTitle>Xác nhận chốt đơn</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            Bạn có chắc chắn muốn chốt đơn cho sản phẩm này?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Sản phẩm:</span>
            </div>
            <p className="text-sm text-gray-900 ml-6">{post?.title || 'N/A'}</p>

            <div className="flex items-center gap-2 mt-3">
              <CheckCircle2 className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Giá:</span>
            </div>
            <p className="text-sm text-gray-900 ml-6 font-semibold">{price}</p>
          </div>

          {/* Transaction Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Loại giao dịch:</label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setTransactionType('internal')}
                className={cn(
                  'w-full flex items-center gap-3 p-3 border-2 rounded-lg transition-all text-left',
                  transactionType === 'internal'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                <div
                  className={cn(
                    'h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    transactionType === 'internal'
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                  )}
                >
                  {transactionType === 'internal' && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <Store className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm font-medium block">Bán trong hệ thống</span>
                  <p className="text-xs text-gray-500">
                    Giao dịch được quản lý và theo dõi trong hệ thống
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('external')}
                className={cn(
                  'w-full flex items-center gap-3 p-3 border-2 rounded-lg transition-all text-left',
                  transactionType === 'external'
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                <div
                  className={cn(
                    'h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    transactionType === 'external'
                      ? 'border-orange-600 bg-orange-600'
                      : 'border-gray-300'
                  )}
                >
                  {transactionType === 'external' && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <ExternalLink className="h-4 w-4 text-orange-600 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm font-medium block">Bán ngoài hệ thống</span>
                  <p className="text-xs text-gray-500">
                    Giao dịch được thực hiện bên ngoài hệ thống
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Xác nhận chốt đơn
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

