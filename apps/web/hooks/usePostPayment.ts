import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createPostPayment,
  getPostPaymentByPostId,
  getPostPaymentsByAccountId,
  getAllPostPayments,
  checkPostPayment,
  deletePostPayment,
  getMyPostPayments,
} from '@/lib/api/postPaymentApi';

/**
 * Hook to create a post payment record
 */
export const useCreatePostPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPostPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postPayments'] });
      queryClient.invalidateQueries({ queryKey: ['myPostPayments'] });
    },
  });
};

/**
 * Hook to get post payment by post ID
 */
export const usePostPaymentByPostId = (postId: string) => {
  return useQuery({
    queryKey: ['postPayments', 'post', postId],
    queryFn: () => getPostPaymentByPostId(postId),
    enabled: !!postId,
  });
};

/**
 * Hook to get post payments by account ID
 */
export const usePostPaymentsByAccountId = (accountId: number) => {
  return useQuery({
    queryKey: ['postPayments', 'account', accountId],
    queryFn: () => getPostPaymentsByAccountId(accountId),
    enabled: !!accountId,
  });
};

/**
 * Hook to get all post payments with pagination
 */
export const useAllPostPayments = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['postPayments', 'all', page, limit],
    queryFn: () => getAllPostPayments(page, limit),
  });
};

/**
 * Hook to check if post has been paid for
 */
export const useCheckPostPayment = (postId: string) => {
  return useQuery({
    queryKey: ['postPayments', 'check', postId],
    queryFn: () => checkPostPayment(postId),
    enabled: !!postId,
  });
};

/**
 * Hook to get my post payments (current user)
 */
export const useMyPostPayments = () => {
  return useQuery({
    queryKey: ['myPostPayments'],
    queryFn: getMyPostPayments,
  });
};

/**
 * Hook to delete post payment
 */
export const useDeletePostPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePostPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postPayments'] });
      queryClient.invalidateQueries({ queryKey: ['myPostPayments'] });
    },
  });
};

/**
 * Hook to check if a post is paid with loading state
 * Useful for UI components that need to show payment status
 */
export const usePostPaymentStatus = (postId: string) => {
  const { data, isLoading, error } = useCheckPostPayment(postId);

  return {
    isPaid: data?.isPaid ?? false,
    isLoading,
    error,
    postId: data?.postId,
  };
};
