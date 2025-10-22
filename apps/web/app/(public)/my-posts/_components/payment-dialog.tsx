'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  const [selectedMethod, setSelectedMethod] = useState<'momo' | 'bank' | 'vnpay'>('momo');

  const verificationFee = 50000; // 50,000 VND

  const paymentMethods = [
    {
      id: 'momo' as const,
      name: 'Ví MoMo',
      icon: '📱',
      description: 'Thanh toán qua ví điện tử MoMo',
      color: 'bg-pink-500',
    },
    {
      id: 'bank' as const,
      name: 'Chuyển khoản ngân hàng',
      icon: '🏦',
      description: 'Chuyển khoản qua ngân hàng',
      color: 'bg-blue-500',
    },
    {
      id: 'vnpay' as const,
      name: 'VNPay',
      icon: '💳',
      description: 'Thanh toán qua VNPay',
      color: 'bg-green-500',
    },
  ];

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Thanh toán thành công!', {
        description: 'Yêu cầu kiểm định đã được gửi đến admin.',
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Thanh toán phí kiểm định
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

          {/* Benefits */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Lợi ích:</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Tin đăng được đánh dấu "Verified"</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Hiển thị ưu tiên trong tìm kiếm</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Phương thức thanh toán:</h4>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full p-3 border rounded-lg text-left transition-colors ${
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${method.color} rounded-full flex items-center justify-center text-white text-sm`}>
                      {method.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{method.name}</div>
                      <div className="text-sm text-gray-500">{method.description}</div>
                    </div>
                    {selectedMethod === method.id && (
                      <CheckCircle className="h-5 w-5 text-blue-500 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Payment Summary */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Phí kiểm định:</span>
              <span className="font-semibold text-gray-900">{formatPrice(verificationFee)}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Tổng cộng:</span>
              <span className="text-red-600">{formatPrice(verificationFee)}</span>
            </div>
          </div>

          {/* Warning */}
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
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Thanh toán {formatPrice(verificationFee)}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
