import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Post } from '@/types/api/post';
import { formatDateTime } from './utils';

interface PostTimeInfoProps {
  createdAt: Post['createdAt'];
  reviewedAt: Post['reviewedAt'];
  updatedAt: Post['updatedAt'];
}

export function PostTimeInfo({ createdAt, reviewedAt, updatedAt }: PostTimeInfoProps) {
  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Thông tin thời gian</h3>
            <p className="text-sm text-gray-600">Lịch sử hoạt động của tin đăng</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">Ngày tạo</span>
            <span className="text-base font-semibold text-gray-900">
              {formatDateTime(createdAt)}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">Ngày duyệt</span>
            <span className="text-base font-semibold text-gray-900">
              {reviewedAt ? formatDateTime(String(reviewedAt)) : 'Chưa duyệt'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-medium text-gray-600">Cập nhật lần cuối</span>
            <span className="text-base font-semibold text-gray-900">
              {formatDateTime(updatedAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
