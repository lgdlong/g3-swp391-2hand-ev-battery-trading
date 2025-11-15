import { Badge } from '@/components/ui/badge';

interface PostInfoCardProps {
  title: string;
  priceVnd: number;
  formatCurrency: (amount: number) => string;
}

export function PostInfoCard({ title, priceVnd, formatCurrency }: PostInfoCardProps) {
  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-2">Bài đăng</h3>
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mt-1">Giá bán: {formatCurrency(priceVnd)} ₫</p>
        <Badge className="mt-2 bg-yellow-500">DRAFT</Badge>
      </div>
    </div>
  );
}
