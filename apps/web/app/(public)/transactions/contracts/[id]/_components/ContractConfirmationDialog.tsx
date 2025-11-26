'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Package, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  confirmByBuyer,
  confirmBySeller,
  forfeitExternal,
  type Contract,
} from '@/lib/api/transactionApi';

interface ContractConfirmationDialogProps {
  contract: Contract;
  currentUserId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ContractConfirmationDialog({
  contract,
  currentUserId,
  isOpen,
  onClose,
  onSuccess,
}: ContractConfirmationDialogProps) {
  const [note, setNote] = useState('');
  const [showForfeitConfirm, setShowForfeitConfirm] = useState(false);
  const queryClient = useQueryClient();

  const isBuyer = contract.buyerId === currentUserId;
  const isSeller = contract.sellerId === currentUserId;
  const canConfirm = isBuyer ? !contract.buyerConfirmedAt : !contract.sellerConfirmedAt;

  // Buyer confirm mutation
  const buyerConfirmMutation = useMutation({
    mutationFn: (dto: { note?: string }) => confirmByBuyer(contract.id, dto),
    onSuccess: () => {
      toast.success('Đã xác nhận đã nhận hàng thành công!');
      queryClient.invalidateQueries({ queryKey: ['contract', contract.id] });
      onSuccess?.();
      onClose();
      setNote('');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xác nhận');
    },
  });

  // Seller confirm mutation
  const sellerConfirmMutation = useMutation({
    mutationFn: (dto: { note?: string }) => confirmBySeller(contract.id, dto),
    onSuccess: () => {
      toast.success('Đã xác nhận giao hàng thành công!');
      queryClient.invalidateQueries({ queryKey: ['contract', contract.id] });
      onSuccess?.();
      onClose();
      setNote('');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xác nhận');
    },
  });

  // Forfeit external mutation
  const forfeitMutation = useMutation({
    mutationFn: () => forfeitExternal(contract.id),
    onSuccess: () => {
      toast.success('Đã báo bán ngoài hệ thống');
      queryClient.invalidateQueries({ queryKey: ['contract', contract.id] });
      onSuccess?.();
      setShowForfeitConfirm(false);
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const handleConfirm = () => {
    if (isBuyer) {
      buyerConfirmMutation.mutate({ note: note.trim() || undefined });
    } else if (isSeller) {
      sellerConfirmMutation.mutate({ note: note.trim() || undefined });
    }
  };

  const handleForfeit = () => {
    forfeitMutation.mutate();
  };

  const isLoading = buyerConfirmMutation.isPending || sellerConfirmMutation.isPending || forfeitMutation.isPending;

  if (showForfeitConfirm) {
    return (
      <AlertDialog open={showForfeitConfirm} onOpenChange={setShowForfeitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <AlertDialogTitle>Báo bán ngoài hệ thống</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              Bạn có chắc chắn muốn báo đã bán sản phẩm ngoài hệ thống không?
              <br />
              <span className="font-semibold text-orange-600 mt-2 block">
                Hành động này không thể hoàn tác. Tiền đặt cọc sẽ bị giữ lại.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleForfeit}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? 'Đang xử lý...' : 'Xác nhận báo bán ngoài'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {isBuyer ? (
              <div className="p-2 bg-blue-100 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            ) : (
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            )}
            <AlertDialogTitle>
              {isBuyer ? 'Xác nhận đã nhận hàng' : 'Xác nhận đã giao hàng'}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            {isBuyer
              ? 'Bạn đã nhận hàng và đồng ý với giao dịch này?'
              : 'Bạn đã giao hàng thành công cho người mua?'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="note"
              placeholder={isBuyer ? 'Nhập ghi chú nếu có...' : 'Nhập ghi chú nếu có...'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          {isSeller && (
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                onClick={() => setShowForfeitConfirm(true)}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Báo bán ngoài hệ thống
              </Button>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || !canConfirm}
            className={isBuyer ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
          >
            {isLoading ? (
              'Đang xử lý...'
            ) : isBuyer ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Xác nhận đã nhận
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Xác nhận đã giao
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}



