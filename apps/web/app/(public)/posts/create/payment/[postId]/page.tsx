'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { PostInfoCard } from './_components/PostInfoCard';
import { WalletBalanceCard } from './_components/WalletBalanceCard';
import { PaymentSummary } from './_components/PaymentSummary';
import { RepublishSection } from './_components/RepublishSection';
import { PaymentButton } from './_components/PaymentButton';
import { PaymentInfoNotes } from './_components/PaymentInfoNotes';
import { PendingReviewBanner } from './_components/PendingReviewBanner';
import { usePostPaymentData, usePaymentHandlers, usePostRedirect } from './hooks';
import { calculatePostingFee, formatCurrency, getPostPaymentStatus } from './helpers';

export default function PostPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.postId as string;
  const { user } = useAuth();

  // Fetch all data using custom hook
  const {
    post,
    wallet,
    feeTiers,
    paymentCheck,
    isLoading,
    postError,
    isRefetchingPost,
    refetchWallet,
  } = usePostPaymentData(postId, user?.id);

  // Redirect if post is already processed
  usePostRedirect(post, isRefetchingPost);

  // Calculate fees and balances
  const postPrice = post ? Number.parseFloat(post.priceVnd) : 0;
  const depositFee = calculatePostingFee(postPrice, feeTiers);
  const currentCoins = wallet ? Number.parseFloat(wallet.balance) : 0;
  const hasEnoughCoins = currentCoins >= depositFee;

  // Get payment status flags
  const { isPendingReview, isAlreadyPaid, isDraftOrRejected } = getPostPaymentStatus(
    post?.status,
    paymentCheck?.isPaid || false,
  );

  // Payment handlers
  const { isProcessing, handlePayment, handleRepublish } = usePaymentHandlers({
    postId,
    postPrice,
    depositFee,
    currentCoins,
    hasEnoughCoins,
    formatCurrency,
  });

  if (isLoading) {
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
              isLoadingWallet={false}
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
                  isLoadingWallet={false}
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
