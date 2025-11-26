'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SellerRatingDisplayProps {
  averageRating: number; // 0-5
  totalReviews: number; // Tổng số đánh giá
  className?: string;
}

/**
 * SellerRatingDisplay - Hiển thị đánh giá trung bình của seller
 * - Hiển thị sao trung bình (0-5)
 * - Hiển thị tổng số đánh giá
 * - Nếu không có đánh giá → hiển thị 0 sao
 * 
 * @example
 * ```tsx
 * <SellerRatingDisplay
 *   averageRating={4.4}
 *   totalReviews={8}
 * />
 * // Output: ⭐ 4.4 (8 Đánh giá)
 * ```
 */
export function SellerRatingDisplay({
  averageRating,
  totalReviews,
  className,
}: SellerRatingDisplayProps) {
  // Validate rating (0-5)
  const validRating = Math.max(0, Math.min(5, averageRating || 0));
  
  // Format rating để hiển thị 1 chữ số thập phân
  const formattedRating = validRating.toFixed(1);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Star Icon */}
      <div className="flex items-center gap-1">
        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        <span className="font-semibold text-base">{formattedRating}/5.0</span>
      </div>

      {/* Total Reviews */}
      <span className="text-sm text-muted-foreground">
        ({totalReviews} Đánh giá)
      </span>
    </div>
  );
}
