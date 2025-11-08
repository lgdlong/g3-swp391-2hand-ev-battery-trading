import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ShoppingBag, CheckCircle } from 'lucide-react';
import { relativeTime } from '@/lib/utils/format';
import Link from 'next/link';
import type { Post } from '@/types/post';
import { getPostDetailRoute, getPostTypeLabel } from '../_utils/postUtils';

interface SoldPostCardProps {
  post: Post;
}

function formatPrice(price: string | number | null | undefined): string {
  if (!price) return 'N/A';
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(num);
}

export function SoldPostCard({ post }: SoldPostCardProps) {
  const firstImageUrl = post.images?.[0]?.url || '/placeholder.png';
  const postTypeLabel = getPostTypeLabel(post.postType);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 flex gap-4">
            <img
              src={firstImageUrl}
              alt={post.title}
              className="w-20 h-20 object-cover rounded-md flex-shrink-0"
            />
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{post.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>
                    Loại: <span className="font-semibold text-foreground">{postTypeLabel}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>
                    Giá: <span className="font-semibold text-foreground">{formatPrice(post.priceVnd)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Đã bán
            </Badge>
            <span className="text-xs text-muted-foreground">{relativeTime(post.updatedAt)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <p>Đã đánh dấu là đã bán: {relativeTime(post.updatedAt)}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={getPostDetailRoute(post.postType, post.id)}>Xem chi tiết</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

