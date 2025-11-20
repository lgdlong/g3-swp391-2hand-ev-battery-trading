import { Check } from 'lucide-react';
import { Post } from '@/types/api/post';
import { PostStatusBadge } from './PostStatusBadge';
import { formatPrice } from './utils';

interface PostBasicInfoProps {
  post: Post;
}

export function PostBasicInfo({ post }: PostBasicInfoProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <Check className="w-4 h-4 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium text-gray-600 mb-1">Tiêu đề</div>
          <div className="text-lg font-semibold text-gray-900 leading-tight">{post.title}</div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-600 mb-1">Mô tả</div>
          <div className="text-gray-700 leading-relaxed whitespace-pre-line break-words">
            {post.description || 'Chưa có mô tả'}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-600 mb-1">Giá bán</div>
          <div className="text-2xl font-bold text-green-600">
            {post.isNegotiable ? 'Liên hệ' : formatPrice(post.priceVnd)}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">Trạng thái</div>
            <PostStatusBadge status={post.status} />
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-600 mb-1">Địa chỉ</div>
          <div className="text-gray-700">
            {[
              typeof post.wardNameCached === 'string' ? post.wardNameCached : '',
              typeof post.districtNameCached === 'string' ? post.districtNameCached : '',
              typeof post.provinceNameCached === 'string' ? post.provinceNameCached : '',
            ]
              .filter(Boolean)
              .join(', ')}
          </div>
        </div>
      </div>
    </div>
  );
}
