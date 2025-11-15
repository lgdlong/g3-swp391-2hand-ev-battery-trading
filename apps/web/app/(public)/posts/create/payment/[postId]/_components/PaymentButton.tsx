import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

interface PaymentButtonProps {
  depositFee: number;
  hasEnoughCoins: boolean;
  isPendingReview: boolean;
  isProcessing: boolean;
  isLoadingWallet: boolean;
  formatCurrency: (amount: number) => string;
  onPayment: () => void;
}

export function PaymentButton({
  depositFee,
  hasEnoughCoins,
  isPendingReview,
  isProcessing,
  isLoadingWallet,
  formatCurrency,
  onPayment,
}: PaymentButtonProps) {
  return (
    <Button
      onClick={onPayment}
      className={`w-full h-14 text-lg font-semibold ${
        hasEnoughCoins && !isPendingReview
          ? 'bg-green-600 hover:bg-green-700'
          : 'bg-gray-400 cursor-not-allowed'
      }`}
      disabled={isProcessing || !hasEnoughCoins || isLoadingWallet || isPendingReview}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Đang xử lý...
        </>
      ) : isPendingReview ? (
        <>
          <CheckCircle className="h-5 w-5 mr-2" />
          Đã thanh toán - Tiếp tục upload ảnh
        </>
      ) : (
        `${formatCurrency(depositFee)} ₫ - THANH TOÁN`
      )}
    </Button>
  );
}
