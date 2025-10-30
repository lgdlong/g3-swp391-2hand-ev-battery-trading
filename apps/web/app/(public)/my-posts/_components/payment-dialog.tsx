'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Coins, Shield, Loader2, RefreshCw, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { getMyWallet } from '@/lib/api/walletApi';
import { requestPostVerification } from '@/lib/api/verificationApi';
import Image from 'next/image';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postTitle: string;
  postId: string;
  postImage?: string;
  isRetry?: boolean;
  onPaymentSuccess: () => void;
}

type PaymentMethod = 'coin' | 'bank' | 'momo';

export function PaymentDialog({
  open,
  onOpenChange,
  postTitle,
  postId,
  postImage,
  isRetry = false,
  onPaymentSuccess,
}: PaymentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('coin');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const verificationFee = 50000; // 50,000 VND
  const totalAmount = verificationFee;

  // Fetch wallet balance from database
  const {
    data: wallet,
    isLoading: isLoadingWallet,
    refetch: refetchWallet,
  } = useQuery({
    queryKey: ['wallet', 'me'],
    queryFn: getMyWallet,
    enabled: !!user && open,
  });

  // Get current coin balance from wallet (database)
  const currentCoins = wallet ? parseFloat(wallet.balance) : 0;
  const hasEnoughCoins = currentCoins >= totalAmount;

  const handlePayment = async () => {
    if (selectedMethod === 'coin' && !hasEnoughCoins) {
      toast.error('Không đủ coin', {
        description: `Bạn cần ${new Intl.NumberFormat('vi-VN').format(totalAmount)} ₫ để kiểm định. Hiện tại bạn có ${new Intl.NumberFormat('vi-VN').format(currentCoins)} ₫.`,
        duration: 5000,
      });
      return;
    }

    // if (selectedMethod === 'bank') {
    //   toast.info('Chức năng đang phát triển', {
    //     description: 'Phương thức chuyển khoản ngân hàng sẽ sớm được cập nhật.',
    //     duration: 3000,
    //   });
    //   return;
    // }

    // if (selectedMethod === 'momo') {
    //   toast.info('Chức năng đang phát triển', {
    //     description: 'Phương thức ví MoMo sẽ sớm được cập nhật.',
    //     duration: 3000,
    //   });
    //   return;
    // }

    setIsProcessing(true);

    try {
      // Call backend API to process payment and create verification request
      await requestPostVerification(postId);

      toast.success('Thanh toán thành công!', {
        description: `Đã trừ ${new Intl.NumberFormat('vi-VN').format(totalAmount)} ₫.`,
        duration: 5000,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['wallet', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['myPosts'] });
      queryClient.invalidateQueries({ queryKey: ['carPosts'] });
      queryClient.invalidateQueries({ queryKey: ['bikePosts'] });
      queryClient.invalidateQueries({ queryKey: ['batteryPosts'] });

      onPaymentSuccess();
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Vui lòng thử lại sau.';
      toast.error('Thanh toán thất bại', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold">Dịch vụ</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            {postImage ? (
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                <Image src={postImage} alt={postTitle} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-gray-200 flex items-center justify-center">
                <Shield className="h-10 w-10 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{postTitle}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {isRetry ? 'Kiểm định lại' : 'Đẩy tin 1 ngày'}
                </Badge>
                <span className="text-red-600 font-bold">{formatCurrency(verificationFee)} ₫</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Price Summary */}
          <div className="space-y-2 bg-white border rounded-lg p-4">
            <div className="flex justify-between text-base font-bold">
              <span>Tổng tiền thanh toán</span>
              <span className="text-lg text-red-600">{formatCurrency(totalAmount)} ₫</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-semibold mb-3">Chọn hình thức thanh toán</h3>
            <div className="space-y-3">
              {/* (Coin) */}
              <button
                type="button"
                onClick={() => setSelectedMethod('coin')}
                className={`w-full p-4 border-2 rounded-lg flex items-center justify-between transition-all ${
                  selectedMethod === 'coin'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                    <Coins className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Coin</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-zinc-600">
                        Số dư:{' '}
                        <strong className="text-red-600 font-bold">
                          {isLoadingWallet ? '...' : formatCurrency(currentCoins)} ₫
                        </strong>
                      </p>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          refetchWallet();
                        }}
                        className="text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
                {selectedMethod === 'coin' && hasEnoughCoins && (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
                {selectedMethod === 'coin' && !hasEnoughCoins && !isLoadingWallet && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Navigate to top-up page or open top-up modal
                      toast.info('Chức năng nạp coin sẽ sớm được cập nhật');
                    }}
                  >
                    Nạp thêm
                  </Button>
                )}
              </button>

              {/* {selectedMethod === 'coin' && !hasEnoughCoins && !isLoadingWallet && (
                <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <p className="font-medium">Số dư không đủ!</p>
                  <p className="text-xs mt-1">
                    Bạn cần nạp thêm {formatCurrency(totalAmount - currentCoins)} ₫ để thanh toán.
                  </p>
                </div>
              )} */}

              {/* Chuyển khoản ngân hàng */}
              {/* <button
                onClick={() => setSelectedMethod('bank')}
                className={`w-full p-4 border-2 rounded-lg flex items-center justify-between transition-all ${
                  selectedMethod === 'bank'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Chuyển khoản ngân hàng</p>
                  </div>
                </div>
                {selectedMethod === 'bank' && (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </button> */}

              {/* Ví MoMo */}
              {/* <button
                onClick={() => setSelectedMethod('momo')}
                className={`w-full p-4 border-2 rounded-lg flex items-center justify-between transition-all ${
                  selectedMethod === 'momo'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Ví MoMo</p>
                    <p className="text-sm text-gray-600">Hướng dẫn tải và thanh toán</p>
                  </div>
                </div>
                {selectedMethod === 'momo' && (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </button> */}
            </div>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            className={`w-full h-14 text-lg font-semibold ${
              selectedMethod === 'coin' && hasEnoughCoins
                ? 'bg-green-600 hover:bg-green-700'
                : selectedMethod !== 'coin'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={
              isProcessing || (selectedMethod === 'coin' && !hasEnoughCoins) || isLoadingWallet
            }
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              `${formatCurrency(totalAmount)} ₫ - THANH TOÁN`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
