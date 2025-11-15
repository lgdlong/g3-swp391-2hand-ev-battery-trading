import { Separator } from '@/components/ui/separator';

interface PaymentSummaryProps {
  depositFee: number;
  formatCurrency: (amount: number) => string;
}

export function PaymentSummary({ depositFee, formatCurrency }: PaymentSummaryProps) {
  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-3">Chi tiết thanh toán</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Phí đăng bài</span>
          <span className="font-medium">{formatCurrency(depositFee)} ₫</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between text-lg font-bold text-gray-900">
          <span>Tổng cộng</span>
          <span className="text-green-600">{formatCurrency(depositFee)} ₫</span>
        </div>
      </div>
    </div>
  );
}
