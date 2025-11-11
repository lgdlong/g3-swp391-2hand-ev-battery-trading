'use client';

import { RatingModal } from '@/components/RatingModal';
import { SellerRatingDisplay } from '@/components/SellerRatingDisplay';
import { useSellerRating } from '@/hooks/useSellerRating';

export default function AbcPage() {
  // Lấy đánh giá của seller (hiện tại dùng mock data)
  const { averageRating, totalReviews, isLoading } = useSellerRating('seller-123');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">ABC Page</h1>
          <p className="text-muted-foreground">This is the ABC page content.</p>
        </div>

        {/* Seller Rating Display */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Đánh giá của người bán</h2>
          
          {isLoading ? (
            <div className="text-muted-foreground">Đang tải...</div>
          ) : (
            <SellerRatingDisplay
              averageRating={averageRating}
              totalReviews={totalReviews}
            />
          )}
        </div>

        {/* Rating Modal */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Đánh giá sản phẩm</h2>
          <p className="text-muted-foreground">
            Bạn đã mua sản phẩm này? Hãy chia sẻ trải nghiệm của bạn!
          </p>
          
          {/* ✨ RatingModal - Uncontrolled Component */}
          <RatingModal
            postId="1" // TODO: Thay bằng postId thật
            postTitle="Pin xe máy điện VinFast"
            buttonText="Viết đánh giá"
          />
        </div>
      </div>
    </div>
  );
}
