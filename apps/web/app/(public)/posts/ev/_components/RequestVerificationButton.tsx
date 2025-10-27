'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestPostVerification } from '@/lib/api/verificationApi';
import { useAuth } from '@/lib/auth-context';
import { PostUI } from '@/types/post';
import { Loader2, Shield, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentDialog } from '@/app/(public)/my-posts/_components/payment-dialog';

interface RequestVerificationButtonProps {
  post: PostUI;
  onSuccess?: () => void;
}

export function RequestVerificationButton({ post, onSuccess }: RequestVerificationButtonProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { user, isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  // Kiểm tra xem người dùng hiện tại có phải là chủ bài đăng không
  // Use loose comparison to handle type coercion (number vs string)
  const isOwner = isLoggedIn && user && user.id == post.seller.id;

  // Mutation để gửi yêu cầu kiểm định
  const requestVerificationMutation = useMutation({
    mutationFn: (postId: string) => {
      console.log('Requesting verification for post:', {
        postId,
        postStatus: post.status,
        verificationRequest: post.verificationRequest,
        userId: user?.id,
        sellerId: post.seller.id,
      });
      return requestPostVerification(postId);
    },
    onSuccess: () => {
      toast.success('Yêu cầu kiểm định đã được gửi thành công!', {
        description: 'Admin sẽ xem xét và phản hồi trong thời gian sớm nhất.',
        duration: 5000,
      });

      // Invalidate và refetch dữ liệu bài đăng
      queryClient.invalidateQueries({ queryKey: ['post', post.id] });
      queryClient.invalidateQueries({ queryKey: ['myPosts'] });
      // Invalidate public posts pages to show verification status
      queryClient.invalidateQueries({ queryKey: ['carPosts'] });
      queryClient.invalidateQueries({ queryKey: ['bikePosts'] });
      queryClient.invalidateQueries({ queryKey: ['batteryPosts'] });
      // Invalidate wallet to update balance
      queryClient.invalidateQueries({ queryKey: ['wallet', 'me'] });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      console.error('Error requesting verification:', error);
      console.error('Error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        message: error?.response?.data?.message,
        data: error?.response?.data,
      });

      const errorMessage = error?.response?.data?.message || error?.message || 'Vui lòng thử lại sau.';
      toast.error('Không thể gửi yêu cầu kiểm định', {
        description: errorMessage,
        duration: 7000,
      });
    },
  });

  const handleRequestVerification = () => {
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = () => {
    // Payment dialog already calls backend API
    // Just close and show success message
  };

  // Chỉ hiển thị nút nếu:
  // 1. Người dùng đã đăng nhập
  // 2. Người dùng là chủ bài đăng
  // 3. Bài đăng có trạng thái PUBLISHED
  // 4. Bài đăng chưa được kiểm định
  // 5. Bài đăng chưa có yêu cầu kiểm định nào
  if (!isOwner || !isLoggedIn) {
    console.log('RequestVerificationButton: User is not owner or not logged in', {
      isOwner,
      isLoggedIn,
      userId: user?.id,
      sellerId: post.seller.id,
    });
    return null;
  }

  const canRequestVerification =
    post.status === 'PUBLISHED' &&
    post.verificationRequest?.status !== 'APPROVED' &&
    !post.verificationRequest;

  const canRequestAgain =
    post.status === 'PUBLISHED' &&
    post.verificationRequest?.status !== 'APPROVED' &&
    post.verificationRequest?.status === 'REJECTED';

  const isPendingVerification =
    post.status === 'PUBLISHED' &&
    post.verificationRequest?.status === 'PENDING';
  // Debug log to verify fields are now properly mapped
  console.log('RequestVerificationButton: Post verification status', {
    postId: post.id,
    status: post.status,
    verificationRequest: post.verificationRequest,
    canRequestVerification,
    canRequestAgain,
    isOwner,
    isLoggedIn,
  });

  // Hiển thị trạng thái "đang chờ kiểm định"
  if (isPendingVerification) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-2 bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
        disabled
      >
        <Clock className="h-4 w-4" />
        Đang chờ kiểm định
      </Button>
    );
  }
  if (!canRequestVerification && !canRequestAgain) {
    return null;
  }

  return (
    <>
      <Button
        onClick={handleRequestVerification}
        disabled={requestVerificationMutation.isPending}
        className={`gap-2 text-white ${canRequestAgain ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        size="sm"
      >
        {requestVerificationMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang gửi...
          </>
        ) : (
          <>
            <Shield className="h-4 w-4" />
            Yêu cầu kiểm định
          </>
        )}
      </Button>

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        postTitle={post.title}
        postId={post.id}
        postImage={post.images?.[0]?.url}
        isRetry={!!canRequestAgain}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}


