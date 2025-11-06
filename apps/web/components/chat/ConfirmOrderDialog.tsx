'use client';

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
import { Package, CheckCircle2 } from 'lucide-react';
import { Conversation } from '@/types/chat';

interface ConfirmOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
  onConfirm: () => void;
}

export function ConfirmOrderDialog({
  isOpen,
  onClose,
  conversation,
  onConfirm,
}: ConfirmOrderDialogProps) {
  const post = conversation.post;
  const price = post?.priceVnd
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(parseInt(post.priceVnd))
    : 'Chưa có giá';

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
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

            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-gray-500">
                Sau khi chốt đơn, buyer sẽ nhận được thông báo và có thể xác nhận đã nhận hàng.
              </span>
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

