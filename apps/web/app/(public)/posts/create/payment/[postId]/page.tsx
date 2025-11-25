'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Coins, RefreshCw, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { getMyWallet } from '@/lib/api/walletApi';
import { getPostById, deductPostCreationFee, publishPost } from '@/lib/api/postApi';
import { getAllFeeTiers } from '@/lib/api/feeTiersApi';

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

    // Calculate deposit amount using depositRate
    const depositRate =
      typeof applicableTier.depositRate === 'string'
        ? Number.parseFloat(applicableTier.depositRate)
        : applicableTier.depositRate;
    return Math.round(postPrice * depositRate);
  })();

  const currentBalance = wallet ? Number.parseFloat(wallet.balance) : 0;
  const hasEnoughBalance = currentBalance >= depositFee;

  // Check if post has already been paid - if status is PENDING_REVIEW, user should go to upload images
  const isPendingReview = post?.status === 'PENDING_REVIEW';

  const handlePayment = async () => {
    if (!hasEnoughBalance) {
      toast.error('Không đủ tiền', {
        description: `Bạn cần ${formatCurrency(depositFee)} ₫ để đăng bài. Hiện tại bạn có ${formatCurrency(currentBalance)} ₫.`,
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

  if (isLoadingPost || isLoadingWallet || isLoadingFeeTiers || isRefetchingPost) {
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
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Bài đăng</h3>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium text-gray-900">{post.title}</p>
                <p className="text-sm text-gray-600 mt-1">Giá bán: {formatCurrency(postPrice)} ₫</p>
                <Badge className="mt-2 bg-yellow-500">DRAFT</Badge>
              </div>
            </div>

            <Separator />

            {/* Payment Method */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Phương thức thanh toán</h3>
              <div className="p-4 border-2 border-green-500 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <Coins className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Ví</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-zinc-600">
                          Số dư:{' '}
                          <strong
                            className={`font-bold ${hasEnoughBalance ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {isLoadingWallet ? '...' : formatCurrency(currentBalance)} ₫
                          </strong>
                        </p>
                        <button
                          onClick={() => refetchWallet()}
                          className="text-blue-600 hover:text-blue-700"
                          aria-label="Refresh wallet balance"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {hasEnoughBalance && (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {!hasEnoughBalance && (
                <div className="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">Không đủ tiền</p>
                      <p className="text-sm text-orange-700 mt-1">
                        Bạn cần nạp thêm {formatCurrency(depositFee - currentBalance)} ₫ để thanh
                        toán.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/wallet')}
                        className="mt-2 border-orange-500 text-orange-700 hover:bg-orange-100"
                      >
                        Nạp tiền ngay
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Payment Summary */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Chi tiết thanh toán</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Phí đặt cọc đăng bài</span>
                  <span className="font-medium">{formatCurrency(depositFee)} ₫</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Tổng cộng</span>
                  <span className="text-green-600">{formatCurrency(depositFee)} ₫</span>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <Button
              onClick={handlePayment}
              className={`w-full h-14 text-lg font-semibold ${
                hasEnoughBalance && !isPendingReview
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={isProcessing || !hasEnoughBalance || isLoadingWallet || isPendingReview}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : isPendingReview ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Đã thanh toán - Tiếp tục upload ảnh
                </>
              ) : (
                `${formatCurrency(depositFee)} ₫ - THANH TOÁN`
              )}
            </Button>

            {/* Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Lưu ý:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>Sau khi thanh toán, bài đăng sẽ chuyển sang trạng thái chờ duyệt</li>
                    <li>Bạn có thể upload hình ảnh sau khi thanh toán thành công</li>
                    <li>Phí đăng bài không được hoàn lại</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Already Paid Warning */}
            {isPendingReview && (
              <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Thanh toán thành công!</p>
                    <p className="text-sm text-green-800 mt-1">
                      Bài đăng của bạn đã được thanh toán. Vui lòng tiếp tục{' '}
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => router.push(`/posts/create/upload-images/${postId}`)}
                        className="p-0 h-auto text-green-700 underline font-semibold"
                      >
                        upload hình ảnh
                      </Button>{' '}
                      để hoàn tất quá trình đăng bài.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
