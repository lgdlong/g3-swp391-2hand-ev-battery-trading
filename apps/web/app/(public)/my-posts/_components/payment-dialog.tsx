'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Coins, Shield, CheckCircle, AlertCircle, Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/api/accountApi';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postTitle: string;
  postId: string;
  isRetry?: boolean;
  onPaymentSuccess: () => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  postTitle,
  postId,
  isRetry = false,
  onPaymentSuccess,
}: PaymentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const verificationFee = 10; // 10 coins

  // Fetch user profile to get current coin balance
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => getCurrentUser(),
    enabled: !!user?.id && open,
  });

  // TODO: Remove this mock data when backend coins system is ready
  const currentCoins = 200; // Mock 200 coins for testing
  // const currentCoins = userProfile?.coins || 0; // Use this when backend is ready
  const hasEnoughCoins = currentCoins >= verificationFee;

  const handlePayment = async () => {
    if (!hasEnoughCoins) {
      toast.error('Không đủ coin', {
        description: `Bạn cần ${verificationFee} coins để kiểm định. Hiện tại bạn có ${currentCoins} coins.`,
        duration: 5000,
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate coin payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success('Thanh toán thành công!', {
        description: `Đã trừ ${verificationFee} coins. Yêu cầu kiểm định đã được gửi đến admin.`,
        duration: 5000,
      });

      onPaymentSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Thanh toán thất bại', {
        description: 'Vui lòng thử lại sau.',
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            Thanh toán bằng Coin
          </DialogTitle>
          <DialogDescription>
            Tin đăng: <span className="font-medium text-foreground">{postTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Service Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">
                  {isRetry ? 'Kiểm định lại' : 'Kiểm định lần đầu'}
                </h3>
                <p className="text-sm text-blue-700">
                  Admin sẽ kiểm tra và xác minh thông tin bài đăng của bạn
                </p>
              </div>
            </div>
          </div>

          {/* Coin Balance */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Số dư Coin:</span>
              </div>
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="font-bold text-yellow-900">
                  {isLoadingProfile ? '...' : currentCoins}
                </span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Lợi ích:</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Tin đăng được đánh dấu Đã kiểm định</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Hiển thị ưu tiên trong tìm kiếm</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Tăng độ tin cậy với người mua</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Summary */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Phí kiểm định:</span>
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="font-semibold text-gray-900">{verificationFee}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Tổng cộng:</span>
              <div className="flex items-center gap-1">
                <Coins className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-600">{verificationFee} coins</span>
              </div>
            </div>
          </div>

          {/* Insufficient Coins Warning */}
          {!hasEnoughCoins && !isLoadingProfile && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Không đủ coin!</p>
                  <p>
                    Bạn cần {verificationFee} coins để kiểm định. Hiện tại bạn có {currentCoins}{' '}
                    coins.
                  </p>
                  <p className="mt-1 text-xs">
                    Hãy mua thêm coin hoặc kiếm coin từ các hoạt động khác.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* General Warning */}
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p>Phí kiểm định không hoàn lại. Có thể chỉnh sửa và gửi lại nếu không đạt.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isProcessing}
            >
              Hủy
            </Button>
            <Button
              onClick={handlePayment}
              className={`flex-1 ${hasEnoughCoins ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-400 cursor-not-allowed'}`}
              disabled={isProcessing || !hasEnoughCoins || isLoadingProfile}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Coins className="h-4 w-4 mr-2" />
                  {hasEnoughCoins ? `Thanh toán ${verificationFee} coins` : 'Không đủ coin'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
