import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit, Trash2, Eye, Package } from 'lucide-react';
import type { Post, PostStatus } from '@/types/post';

interface PostListItemProps {
  post: Post;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onView?: (post: Post) => void;
  onMarkAsSold?: (postId: string) => void;
}

const formatPrice = (priceVnd: string): string => {
  const price = Number.parseInt(priceVnd);
  if (price === 0) return 'Chưa định giá';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

const getStatusBadgeVariant = (
  status: PostStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'DRAFT':
      return 'secondary';
    case 'PENDING_REVIEW':
      return 'outline';
    case 'PUBLISHED':
      return 'default';
    case 'REJECTED':
      return 'destructive';
    case 'SOLD':
      return 'secondary';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: PostStatus): string => {
  switch (status) {
    case 'DRAFT':
      return 'Bản nháp';
    case 'PENDING_REVIEW':
      return 'Chờ duyệt';
    case 'PUBLISHED':
      return 'Đang hiển thị';
    case 'REJECTED':
      return 'Bị từ chối';
    case 'SOLD':
      return 'Đã bán';
    case 'PAUSED':
      return 'Tạm dừng';
    case 'ARCHIVED':
      return 'Đã lưu trữ';
    default:
      return status;
  }
};

const getStatusTooltip = (status: PostStatus): string => {
  switch (status) {
    case 'PENDING_REVIEW':
      return 'Đang chờ duyệt bởi quản trị viên';
    case 'REJECTED':
      return 'Bài đăng bị từ chối, vui lòng chỉnh sửa';
    case 'PUBLISHED':
      return 'Bài đăng đang hiển thị công khai';
    case 'DRAFT':
      return 'Bản nháp chưa gửi duyệt';
    case 'SOLD':
      return 'Sản phẩm đã được bán';
    default:
      return '';
  }
};

export default function PostListItem({
  post,
  onEdit,
  onDelete,
  onView,
  onMarkAsSold,
}: PostListItemProps) {
  // Get the first image URL
  const firstImageUrl =
    Array.isArray(post.images) && post.images.length > 0
      ? typeof post.images[0] === 'string'
        ? post.images[0]
        : (post.images[0] as { url?: string })?.url
      : '/placeholder.svg';

  // Extract province and district names
  const provinceName =
    typeof post.provinceNameCached === 'object' && post.provinceNameCached !== null
      ? (post.provinceNameCached as { value?: string })?.value
      : (post.provinceNameCached as string);

  const districtName =
    typeof post.districtNameCached === 'object' && post.districtNameCached !== null
      ? (post.districtNameCached as { value?: string })?.value
      : (post.districtNameCached as string);

  return (
    <div className="flex gap-4 py-4 transition-colors hover:bg-muted/50">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
        <img src={firstImageUrl} alt={post.title} className="h-full w-full object-cover" />
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2 min-w-0">
        {/* Title and Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-medium text-base line-clamp-2 flex-1">{post.title}</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant={getStatusBadgeVariant(post.status)} className="shrink-0">
                {getStatusLabel(post.status)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getStatusTooltip(post.status)}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Price, Location, Date */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <p className="font-semibold text-foreground text-red-600">
            {formatPrice(post.priceVnd)}
            {post.isNegotiable && (
              <span className="text-xs font-normal text-muted-foreground ml-1">
                (Có thể thương lượng)
              </span>
            )}
          </p>
          <p className="text-muted-foreground">
            {provinceName}
            {districtName && `, ${districtName}`}
          </p>
          <p className="text-xs text-muted-foreground">Đăng: {formatDate(post.createdAt)}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Edit button - visible for DRAFT, REJECTED */}
          {(post.status === 'DRAFT' || post.status === 'REJECTED') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={() => onEdit?.(post.id)}
                >
                  <Edit className="h-4 w-4" />
                  Sửa
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Chỉnh sửa tin đăng</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* View button - visible for PENDING_REVIEW, PUBLISHED, SOLD */}
          {(post.status === 'PENDING_REVIEW' ||
            post.status === 'PUBLISHED' ||
            post.status === 'SOLD') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={() => onView?.(post)}
                >
                  <Eye className="h-4 w-4" />
                  Xem
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Xem chi tiết</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Mark as Sold button - visible for PUBLISHED */}
          {post.status === 'PUBLISHED' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2"
                  onClick={() => onMarkAsSold?.(post.id)}
                >
                  <Package className="h-4 w-4" />
                  Đã bán
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Đánh dấu đã bán</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Delete button - visible for DRAFT, REJECTED */}
          {(post.status === 'DRAFT' || post.status === 'REJECTED') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="destructive" size="sm" onClick={() => onDelete?.(post.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Xóa tin đăng</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
