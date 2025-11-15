'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { getMyWallet } from '@/lib/api/walletApi';
import { getPostById, deductPostCreationFee, publishPost } from '@/lib/api/postApi';
import { getAllFeeTiers } from '@/lib/api/feeTiersApi';
import { checkPostPayment } from '@/lib/api/postPaymentApi';
import { PostInfoCard } from './_components/PostInfoCard';
import { WalletBalanceCard } from './_components/WalletBalanceCard';
import { PaymentSummary } from './_components/PaymentSummary';
import { RepublishSection } from './_components/RepublishSection';
import { PaymentButton } from './_components/PaymentButton';
import { PaymentInfoNotes } from './_components/PaymentInfoNotes';
import { PendingReviewBanner } from './_components/PendingReviewBanner';

export default function PostPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.postId as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch post details
  const {
    data: post,
    isLoading: isLoadingPost,
    error: postError,
    isFetching: isRefetchingPost,
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });

  // Fetch wallet balance
  const {
    data: wallet,
    isLoading: isLoadingWallet,
    refetch: refetchWallet,
  } = useQuery({
    queryKey: ['wallet', 'me'],
    queryFn: getMyWallet,
    enabled: !!user,
  });

  // Fetch fee tiers
  const { data: feeTiers, isLoading: isLoadingFeeTiers } = useQuery({
    queryKey: ['feeTiers'],
    queryFn: getAllFeeTiers,
  });

  // Check if post has been paid before
  const { data: paymentCheck, isLoading: isLoadingPaymentCheck } = useQuery({
    queryKey: ['postPayment', 'check', postId],
    queryFn: () => checkPostPayment(postId),
    enabled: !!postId,
  });

  // Check if post was already paid - only redirect if status is not DRAFT and not PENDING_REVIEW
  // PENDING_REVIEW means payment was just completed, user should go to upload images
  // Only redirect to my-posts when viewing an already published/approved post
  useEffect(() => {
    // Don't run the effect while the post is being refetched
    if (isRefetchingPost) {
      return;
    }

    if (post && post.status !== 'DRAFT' && post.status !== 'PENDING_REVIEW') {
      // Post is already fully processed (APPROVED, REJECTED, etc.)
      toast.info('Bài đăng này đã được xử lý', {
        description: 'Bạn sẽ được chuyển hướng tới trang quản lý bài đăng',
        duration: 3000,
      });
      router.push('/my-posts');
    }
  }, [post, router, isRefetchingPost]);

  // Calculate fee based on fee tiers (matching backend logic)
  const postPrice = post ? Number.parseFloat(post.priceVnd) : 0;
  const depositFee = (() => {
    if (!feeTiers || feeTiers.length === 0) return 0;

    // Find applicable fee tier
    const applicableTier = feeTiers.find((tier) => {
      const minPrice =
        typeof tier.minPrice === 'string' ? Number.parseFloat(tier.minPrice) : tier.minPrice;
      const maxPrice = tier.maxPrice
        ? typeof tier.maxPrice === 'string'
          ? Number.parseFloat(tier.maxPrice)
          : tier.maxPrice
        : Infinity;
      return postPrice >= minPrice && postPrice <= maxPrice;
    });

    if (!applicableTier) return 0;

    // Get fixed posting fee from tier
    const postingFee =
      typeof applicableTier.postingFee === 'string'
        ? Number.parseFloat(applicableTier.postingFee)
        : applicableTier.postingFee;
    return postingFee;
  })();

  const currentCoins = wallet ? Number.parseFloat(wallet.balance) : 0;
  const hasEnoughCoins = currentCoins >= depositFee;

  // Check if post has already been paid - if status is PENDING_REVIEW, user should go to upload images
  const isPendingReview = post?.status === 'PENDING_REVIEW';
  const isAlreadyPaid = paymentCheck?.isPaid || false;
  const isDraftOrRejected = post?.status === 'DRAFT' || post?.status === 'REJECTED';

  // Handler for re-publishing already paid posts (REJECTED posts)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  if (
    isLoadingPost ||
    isLoadingWallet ||
    isLoadingFeeTiers ||
    isRefetchingPost ||
    isLoadingPaymentCheck
  ) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="relative bg-[#1a2332] text-white overflow-hidden">
          <div className="relative container mx-auto px-4 py-12">
            <Skeleton className="h-10 w-32 bg-white/20" />
            <Skeleton className="h-12 w-64 mt-4 bg-white/20" />
          </div>
        </section>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="relative bg-[#1a2332] text-white overflow-hidden">
          <div className="relative container mx-auto px-4 py-12">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/posts/create')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </section>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bài đăng</h2>
                <p className="text-gray-600 mb-6">
                  Bài đăng không tồn tại hoặc bạn không có quyền truy cập.
                </p>
                <Button onClick={() => router.push('/posts/create')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Về trang tạo bài đăng
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="relative bg-[#1a2332] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#048C73] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#048C73] rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>

          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Thanh toán phí đăng bài</h1>
            <p className="text-gray-300">Hoàn tất thanh toán để đăng bài lên hệ thống</p>
          </div>
        </div>
      </section>

      {/* Payment Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50">
            <CardTitle className="text-xl">Thông tin thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Post Info */}
            <PostInfoCard title={post.title} priceVnd={postPrice} formatCurrency={formatCurrency} />

            <Separator />

            {/* Payment Method */}
            <WalletBalanceCard
              currentCoins={currentCoins}
              depositFee={depositFee}
              hasEnoughCoins={hasEnoughCoins}
              isLoadingWallet={isLoadingWallet}
              formatCurrency={formatCurrency}
              refetchWallet={refetchWallet}
            />

            <Separator />

            {/* Show different UI based on payment status */}
            {isAlreadyPaid && isDraftOrRejected ? (
              /* Already paid - just need to republish */
              <RepublishSection
                postStatus={post?.status || 'DRAFT'}
                isProcessing={isProcessing}
                onRepublish={handleRepublish}
              />
            ) : (
              /* Not paid yet - show payment flow */
              <>
                <PaymentSummary depositFee={depositFee} formatCurrency={formatCurrency} />

                <PaymentButton
                  depositFee={depositFee}
                  hasEnoughCoins={hasEnoughCoins}
                  isPendingReview={isPendingReview}
                  isProcessing={isProcessing}
                  isLoadingWallet={isLoadingWallet}
                  formatCurrency={formatCurrency}
                  onPayment={handlePayment}
                />
              </>
            )}

            {/* Info - show different notes based on payment status */}
            <PaymentInfoNotes isAlreadyPaid={isAlreadyPaid} isDraftOrRejected={isDraftOrRejected} />

            {/* Already Paid Warning */}
            {isPendingReview && <PendingReviewBanner postId={postId} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
