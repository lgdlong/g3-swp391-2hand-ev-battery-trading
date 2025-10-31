import { Card, CardContent } from '@/components/ui/card';
import { Post } from '@/types/chat';
import Image from 'next/image';

interface ProductBannerProps {
  post: Post;
}

export default function ProductBanner({ post }: ProductBannerProps) {
  const firstImage = post.images?.[0];
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(parseInt(post.priceVnd));

  return (
    <Card className="mx-1 mb-4 py-0">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="relative w-12 h-12 shrink-0">
            <Image
              src={firstImage?.url || 'https://placehold.co/600x400/EFEFEF/AAAAAA?text=Product'}
              alt={post.title}
              fill
              className="object-cover rounded-md"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm leading-tight mb-1 line-clamp-2">{post.title}</h3>
            <p className="text-lg font-bold text-primary">{formattedPrice}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
