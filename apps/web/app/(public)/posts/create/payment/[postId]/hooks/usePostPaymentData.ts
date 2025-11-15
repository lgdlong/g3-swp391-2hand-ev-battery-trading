import { useQuery } from '@tanstack/react-query';
import { getPostById } from '@/lib/api/postApi';
import { getMyWallet } from '@/lib/api/walletApi';
import { getAllFeeTiers } from '@/lib/api/feeTiersApi';
import { checkPostPayment } from '@/lib/api/postPaymentApi';

export function usePostPaymentData(postId: string, userId?: number) {
  // Fetch post details
  const postQuery = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });

  // Fetch wallet balance
  const walletQuery = useQuery({
    queryKey: ['wallet', 'me'],
    queryFn: getMyWallet,
    enabled: !!userId,
  });

  // Fetch fee tiers
  const feeTiersQuery = useQuery({
    queryKey: ['feeTiers'],
    queryFn: getAllFeeTiers,
  });

  // Check if post has been paid before
  const paymentCheckQuery = useQuery({
    queryKey: ['postPayment', 'check', postId],
    queryFn: () => checkPostPayment(postId),
    enabled: !!postId,
  });

  const isLoading =
    postQuery.isLoading ||
    walletQuery.isLoading ||
    feeTiersQuery.isLoading ||
    paymentCheckQuery.isLoading ||
    postQuery.isFetching;

  return {
    post: postQuery.data,
    wallet: walletQuery.data,
    feeTiers: feeTiersQuery.data,
    paymentCheck: paymentCheckQuery.data,
    isLoading,
    postError: postQuery.error,
    isRefetchingPost: postQuery.isFetching,
    refetchWallet: walletQuery.refetch,
  };
}
