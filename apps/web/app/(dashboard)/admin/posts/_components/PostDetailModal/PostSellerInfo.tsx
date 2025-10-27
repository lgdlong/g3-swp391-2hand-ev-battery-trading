import { User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Post } from '@/types/api/post';

interface PostSellerInfoProps {
  seller: Post['seller'];
}

export function PostSellerInfo({ seller }: PostSellerInfoProps) {
  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Thông tin người bán</h3>
            <p className="text-sm text-gray-600">Chi tiết về người đăng tin</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">Tên</span>
            <span className="text-base font-semibold text-gray-900">{seller.fullName}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">Email</span>
            <span className="text-base font-semibold text-gray-900">{seller.email}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">Số điện thoại</span>
            <span className="text-base font-semibold text-gray-900">
              {seller.phone || 'Chưa cập nhật'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">Trạng thái</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
              {seller.status || 'active'}
            </Badge>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-medium text-gray-600">Vai trò</span>
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-700 hover:bg-purple-200"
            >
              {seller.role || 'user'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
