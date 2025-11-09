'use client';

import { useState } from 'react';
import { Star, MessageSquare, Calendar, MapPin, DollarSign } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RatingModal } from './RatingModal';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface PurchaseCardProps {
  purchase: {
    id: string;
    postId: string;
    postTitle: string;
    postPrice: string;
    postImages?: Array<{ url: string; public_id: string }>;
    sellerName: string;
    purchasedAt: string;
    hasRated?: boolean;
    userRating?: number;
    userComment?: string;
  };
  onRatingSubmit: (purchaseId: string, rating: number, comment: string) => void;
  isSubmitting?: boolean;
}

/**
 * PurchaseCard - Hiển thị thông tin bài post đã mua
 * - Thumbnail image
 * - Thông tin cơ bản (title, price, seller, date)
 * - Nút "Đánh giá" nếu chưa đánh giá
 * - Hiển thị rating đã có nếu đã đánh giá
 */
export function PurchaseCard({ purchase, onRatingSubmit, isSubmitting }: PurchaseCardProps) {
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const handleRatingSubmit = (rating: number, comment: string) => {
    onRatingSubmit(purchase.id, rating, comment);
    setIsRatingModalOpen(false);
  };

  const thumbnailUrl = purchase.postImages?.[0]?.url || '/placeholder-post.jpg';

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row gap-4 p-4">
          {/* Thumbnail */}
          <Link href={`/posts/ev/${purchase.postId}`} className="shrink-0">
            <div className="relative w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={thumbnailUrl}
                alt={purchase.postTitle}
                fill
                className="object-cover"
              />
            </div>
          </Link>

          {/* Content */}
          <div className="flex-1 space-y-2">
            {/* Title */}
            <Link href={`/posts/ev/${purchase.postId}`}>
              <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">
                {purchase.postTitle}
              </h3>
            </Link>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span className="font-semibold text-primary">
                  {formatCurrency(Number.parseFloat(purchase.postPrice))}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Mua {formatDate(purchase.purchasedAt)}
                </span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Người bán: <span className="font-medium">{purchase.sellerName}</span>
            </div>

            {/* Rating Status */}
            {purchase.hasRated && purchase.userRating ? (
              <div className="flex items-center gap-2 pt-2">
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  Đã đánh giá {purchase.userRating}/5
                </Badge>
                {purchase.userComment && (
                  <Badge variant="outline" className="gap-1">
                    <MessageSquare className="h-3 w-3" />
                    Có nhận xét
                  </Badge>
                )}
              </div>
            ) : (
              <div className="pt-2">
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Chưa đánh giá
                </Badge>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="sm:ml-auto shrink-0 flex flex-col gap-2 justify-center">
            {!purchase.hasRated ? (
              <Button
                onClick={() => setIsRatingModalOpen(true)}
                className="w-full sm:w-auto gap-2"
                disabled={isSubmitting}
              >
                <Star className="h-4 w-4" />
                Đánh giá
              </Button>
            ) : (
              <Button
                onClick={() => setIsRatingModalOpen(true)}
                variant="outline"
                className="w-full sm:w-auto gap-2"
                disabled={isSubmitting}
              >
                <Star className="h-4 w-4" />
                Sửa đánh giá
              </Button>
            )}
            <Link href={`/posts/ev/${purchase.postId}`}>
              <Button variant="ghost" className="w-full sm:w-auto" size="sm">
                Xem chi tiết
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Rating Modal */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
        postTitle={purchase.postTitle}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
