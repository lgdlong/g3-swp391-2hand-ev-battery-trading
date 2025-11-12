'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface SellerRatingStats {
  averageRating: number;
  totalReviews: number;
}

/**
 * useSellerRating - Hook để lấy đánh giá trung bình của seller
 * @param sellerId - ID của seller
 * @returns { averageRating, totalReviews, isLoading, error }
 *
 * @example
 * ```tsx
 * const { averageRating, totalReviews, isLoading } = useSellerRating('seller-123');
 *
 * if (isLoading) return <div>Loading...</div>;
 *
 * <SellerRatingDisplay averageRating={averageRating} totalReviews={totalReviews} />
 * ```
 */
export function useSellerRating(sellerId?: string) {
  const { data, isLoading, error } = useQuery<SellerRatingStats>({
    queryKey: ['seller-rating', sellerId],
    queryFn: async () => {
      if (!sellerId) {
        return { averageRating: 0, totalReviews: 0 };
      }

      try {
        // ✅ Backend Endpoint: GET /ratings/seller/:sellerId/stats
        const response = await api.get(`/ratings/seller/${sellerId}/stats`);
        return response.data;
      } catch (err) {
        console.error('Error fetching seller rating:', err);
        // Return default nếu error
        return { averageRating: 0, totalReviews: 0 };
      }
    },
    enabled: !!sellerId, // Chỉ fetch khi có sellerId
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });

  return {
    averageRating: data?.averageRating ?? 0,
    totalReviews: data?.totalReviews ?? 0,
    isLoading,
    error,
  };
}

/**
 * calculateAverageRating - Tính average rating từ array ratings
 * @param ratings - Array of ratings (0-5)
 * @returns Average rating (0-5), hoặc 0 nếu array rỗng
 *
 * @example
 * ```tsx
 * const ratings = [5, 4, 4, 3];
 * const avg = calculateAverageRating(ratings); // 4.0
 * ```
 */
export function calculateAverageRating(ratings: number[]): number {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal place
}
