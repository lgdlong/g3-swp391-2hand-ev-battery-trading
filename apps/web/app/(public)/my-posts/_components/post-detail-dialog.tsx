import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Post, PostStatus } from '@/types/post';

interface PostDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
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

export default function PostDetailDialog({ open, onOpenChange, post }: PostDetailDialogProps) {
  if (!post) return null;

  // Get the first image URL
  const firstImageUrl =
    Array.isArray(post.images) && post.images.length > 0
      ? typeof post.images[0] === 'string'
        ? post.images[0]
        : (post.images[0] as { url?: string })?.url
      : '/placeholder.svg';

  // Extract province, district, ward names
  const provinceName =
    typeof post.provinceNameCached === 'object' && post.provinceNameCached !== null
      ? (post.provinceNameCached as { value?: string })?.value
      : (post.provinceNameCached as string);

  const districtName =
    typeof post.districtNameCached === 'object' && post.districtNameCached !== null
      ? (post.districtNameCached as { value?: string })?.value
      : (post.districtNameCached as string);

  const wardName =
    typeof post.wardNameCached === 'object' && post.wardNameCached !== null
      ? (post.wardNameCached as { value?: string })?.value
      : (post.wardNameCached as string);

  const submittedAt =
    typeof post.submittedAt === 'object' && post.submittedAt !== null
      ? (post.submittedAt as { value?: string })?.value
      : (post.submittedAt as string);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết tin đăng</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Image */}
          <div className="relative h-64 w-full overflow-hidden rounded-lg bg-muted">
            <img src={firstImageUrl} alt={post.title} className="h-full w-full object-cover" />
          </div>

          {/* Title and Status */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-semibold">{post.title}</h3>
              <Badge variant={getStatusBadgeVariant(post.status)}>
                {getStatusLabel(post.status)}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatPrice(post.priceVnd)}
              {post.isNegotiable && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (Có thể thương lượng)
                </span>
              )}
            </p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm text-muted-foreground">Loại tin</p>
              <p className="font-medium">
                {post.postType === 'EV_CAR'
                  ? 'Xe ô tô'
                  : post.postType === 'EV_BIKE'
                    ? 'Xe máy'
                    : 'Pin'}
              </p>
            </div>
            {post.carDetails && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Năm sản xuất</p>
                  <p className="font-medium">
                    {typeof post.carDetails.manufacture_year === 'object' &&
                    post.carDetails.manufacture_year !== null
                      ? (post.carDetails.manufacture_year as { value?: string | number })?.value
                      : post.carDetails.manufacture_year}
                  </p>
                </div>
                {post.carDetails.odo_km && (
                  <div>
                    <p className="text-sm text-muted-foreground">Số km đã đi</p>
                    <p className="font-medium">
                      {Number(
                        typeof post.carDetails.odo_km === 'object' &&
                          post.carDetails.odo_km !== null
                          ? (post.carDetails.odo_km as { value?: string | number })?.value
                          : post.carDetails.odo_km,
                      ).toLocaleString()}{' '}
                      km
                    </p>
                  </div>
                )}
                {post.carDetails.battery_capacity_kwh && (
                  <div>
                    <p className="text-sm text-muted-foreground">Dung lượng pin</p>
                    <p className="font-medium">
                      {typeof post.carDetails.battery_capacity_kwh === 'object' &&
                      post.carDetails.battery_capacity_kwh !== null
                        ? (post.carDetails.battery_capacity_kwh as { value?: string | number })
                            ?.value
                        : post.carDetails.battery_capacity_kwh}{' '}
                      kWh
                    </p>
                  </div>
                )}
              </>
            )}
            {post.bikeDetails && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Năm sản xuất</p>
                  <p className="font-medium">
                    {typeof post.bikeDetails.manufacture_year === 'object' &&
                    post.bikeDetails.manufacture_year !== null
                      ? (post.bikeDetails.manufacture_year as { value?: string | number })?.value
                      : post.bikeDetails.manufacture_year}
                  </p>
                </div>
                {post.bikeDetails.battery_capacity_kwh && (
                  <div>
                    <p className="text-sm text-muted-foreground">Dung lượng pin</p>
                    <p className="font-medium">
                      {typeof post.bikeDetails.battery_capacity_kwh === 'object' &&
                      post.bikeDetails.battery_capacity_kwh !== null
                        ? (post.bikeDetails.battery_capacity_kwh as { value?: string | number })
                            ?.value
                        : post.bikeDetails.battery_capacity_kwh}{' '}
                      kWh
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Location */}
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground mb-1">Địa chỉ</p>
            <p className="font-medium">
              {provinceName}
              {districtName && `, ${districtName}`}
              {wardName && `, ${wardName}`}
            </p>
          </div>

          {/* Description */}
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground mb-2">Mô tả</p>
            <p className="text-sm leading-relaxed">{post.description}</p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Ngày tạo</p>
              <p className="font-medium">{formatDate(post.createdAt)}</p>
            </div>
            {submittedAt && (
              <div>
                <p className="text-muted-foreground">Ngày gửi duyệt</p>
                <p className="font-medium">{formatDate(submittedAt)}</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
