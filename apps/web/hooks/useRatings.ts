import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMyPurchases,
  submitRating,
  updateRating,
  getPostRatings,
  deleteRating,
} from '@/lib/api/ratingApi';
import type { RatingSubmitDto } from '@/types/rating.types';
import { toast } from 'sonner';

/**
 * React Query hooks for Rating System
 * Ready to use when BE is ready - just uncomment in components
 */

// ==================== QUERY HOOKS ====================

/**
 * Fetch user's purchases (bought posts)
 * Usage: const { data: purchases, isLoading } = useMyPurchases();
 */
export function useMyPurchases() {
  return useQuery({
    queryKey: ['my-purchases'],
    queryFn: getMyPurchases,
    // Uncomment when ready:
    // staleTime: 5 * 60 * 1000, // 5 minutes
    // refetchOnWindowFocus: false,
  });
}

/**
 * Fetch ratings for a specific post
 * Usage: const { data: ratings } = usePostRatings(postId);
 */
export function usePostRatings(postId: string) {
  return useQuery({
    queryKey: ['post-ratings', postId],
    queryFn: () => getPostRatings(postId),
    enabled: !!postId,
  });
}

// ==================== MUTATION HOOKS ====================

/**
 * Submit new rating
 * Usage:
 * const submitRatingMutation = useSubmitRating();
 * submitRatingMutation.mutate({ postId: '123', rating: 5, comment: 'Good!' });
 */
export function useSubmitRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RatingSubmitDto) => submitRating(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['my-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['post-ratings'] });
      toast.success('Đánh giá của bạn đã được gửi thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá';
      toast.error(message);
      console.error('Submit rating error:', error);
    },
  });
}

/**
 * Update existing rating
 * Usage:
 * const updateRatingMutation = useUpdateRating();
 * updateRatingMutation.mutate({ ratingId: '1', data: { rating: 4, comment: 'Updated' } });
 */
export function useUpdateRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ratingId,
      data,
    }: {
      ratingId: string;
      data: { rating: number; comment: string };
    }) => updateRating(ratingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['post-ratings'] });
      toast.success('Đánh giá của bạn đã được cập nhật!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật đánh giá';
      toast.error(message);
      console.error('Update rating error:', error);
    },
  });
}

/**
 * Delete rating (optional)
 * Usage:
 * const deleteRatingMutation = useDeleteRating();
 * deleteRatingMutation.mutate(ratingId);
 */
export function useDeleteRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ratingId: string) => deleteRating(ratingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['post-ratings'] });
      toast.success('Đánh giá đã được xóa!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Có lỗi xảy ra khi xóa đánh giá';
      toast.error(message);
      console.error('Delete rating error:', error);
    },
  });
}

// ==================== USAGE EXAMPLE ====================
/*
// In your component (page.tsx):

import { useMyPurchases, useSubmitRating } from '@/hooks/useRatings';

export default function MyPurchasesPage() {
  // Fetch purchases
  const { data: purchases = [], isLoading } = useMyPurchases();
  
  // Submit rating mutation
  const submitRatingMutation = useSubmitRating();
  
  const handleRatingSubmit = (purchaseId: string, rating: number, comment: string) => {
    submitRatingMutation.mutate({
      postId: purchaseId, // hoặc purchaseId tùy BE
      rating,
      comment,
    });
  };
  
  if (isLoading) return <Loader />;
  
  return (
    <div>
      {purchases.map(purchase => (
        <PurchaseCard
          key={purchase.id}
          purchase={purchase}
          onRatingSubmit={handleRatingSubmit}
          isSubmitting={submitRatingMutation.isPending}
        />
      ))}
    </div>
  );
}
*/
