import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deductPostCreationFee, publishPost, getPostById } from '@/lib/api/postApi';

interface UsePaymentHandlersProps {
  postId: string;
  postPrice: number;
  depositFee: number;
  currentCoins: number;
  hasEnoughCoins: boolean;
  formatCurrency: (amount: number) => string;
}

export function usePaymentHandlers({
  postId,
  postPrice,
  depositFee,
  currentCoins,
  hasEnoughCoins,
  formatCurrency,
}: UsePaymentHandlersProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!hasEnoughCoins) {
      toast.error('Không đủ coin', {
        description: `Bạn cần ${formatCurrency(depositFee)} ₫ để đăng bài. Hiện tại bạn có ${formatCurrency(currentCoins)} ₫.`,
        duration: 5000,
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Deduct fee from wallet
      await deductPostCreationFee(postPrice, postId);
      toast.success('Thanh toán thành công!');

      // Step 2: Update post status to PENDING_REVIEW
      await publishPost(postId);
      toast.success('Bài đăng đã được gửi để chờ duyệt!');

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['wallet', 'me'] });
      await queryClient.invalidateQueries({ queryKey: ['post', postId] });

      // Refresh post data to get updated images
      const updatedPost = await queryClient.fetchQuery({
        queryKey: ['post', postId],
        queryFn: () => getPostById(postId),
      });

      // Check if post has images
      const hasImages =
        updatedPost?.images && Array.isArray(updatedPost.images) && updatedPost.images.length > 0;

      if (hasImages) {
        // Post already has images, go directly to my-posts
        toast.success('Bài đăng đã sẵn sàng!');
        router.push(`/my-posts`);
      } else {
        // No images, redirect to upload page
        router.push(`/posts/create/upload-images/${postId}`);
      }
    } catch (error: unknown) {
      console.error('Payment failed:', error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err?.response?.data?.message || err?.message || 'Thanh toán thất bại';
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRepublish = async () => {
    setIsProcessing(true);

    try {
      // Just update post status to PENDING_REVIEW (no payment needed)
      await publishPost(postId);
      toast.success('Bài đăng đã được gửi lại để chờ duyệt!');

      // Invalidate query to refresh post data
      await queryClient.invalidateQueries({ queryKey: ['post', postId] });

      // Refresh post data to check images
      const updatedPost = await queryClient.fetchQuery({
        queryKey: ['post', postId],
        queryFn: () => getPostById(postId),
      });

      // Check if post has images
      const hasImages =
        updatedPost?.images && Array.isArray(updatedPost.images) && updatedPost.images.length > 0;

      if (hasImages) {
        // Post already has images, go directly to my-posts
        toast.success('Bài đăng đã sẵn sàng!');
        router.push(`/my-posts`);
      } else {
        // No images, redirect to upload page
        router.push(`/posts/create/upload-images/${postId}`);
      }
    } catch (error: unknown) {
      console.error('Re-publish failed:', error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err?.response?.data?.message || err?.message || 'Đăng lại thất bại';
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handlePayment,
    handleRepublish,
  };
}
