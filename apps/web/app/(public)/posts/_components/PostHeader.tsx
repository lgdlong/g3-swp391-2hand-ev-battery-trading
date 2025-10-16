import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { formatVnd, originText, getLocation } from '@/lib/utils/format';
import { HeartCallApi } from '../ev/_components/HeartCallApi';
import type { PostUI } from '@/types/post';

interface PostHeaderProps {
  post: PostUI;
  details?: {
    origin?: string;
  };
}

/**
 * Post Header Component - Shows title, price, origin badge, and location
 */
export function PostHeader({ post, details }: PostHeaderProps) {
  return (
    <Card className="border-none shadow-none">
      <CardContent className="py-2 px-6">
        <div className="flex flex-col items-start justify-between mb-4 gap-4">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
            <HeartCallApi postId={Number(post.id)} initialBookmark={null} />
          </div>
          <div className="text-2xl font-bold text-red-600 mb-2">{formatVnd(post.priceVnd)}</div>
        </div>
        <div className="mb-6">{details?.origin && <Badge>{originText(details.origin)}</Badge>}</div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{getLocation(post)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
