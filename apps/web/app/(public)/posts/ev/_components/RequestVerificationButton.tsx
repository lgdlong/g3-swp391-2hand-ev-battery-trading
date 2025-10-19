'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestPostVerification } from '@/lib/api/verificationApi';
import { useAuth } from '@/lib/auth-context';
import { PostUI } from '@/types/post';
import { CheckCircle, Loader2, AlertCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface RequestVerificationButtonProps {
  post: PostUI;
  onSuccess?: () => void;
}

export function RequestVerificationButton({ post, onSuccess }: RequestVerificationButtonProps) {
  const [isRequested, setIsRequested] = useState(false);
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
        isVerified: post.isVerified,
        verificationRequestedAt: post.verificationRequestedAt,
        userId: user?.id,
        sellerId: post.seller.id,
      });
      return requestPostVerification(postId);
    },
    onSuccess: () => {
      setIsRequested(true);
      toast.success('Yêu cầu kiểm định đã được gửi thành công!', {
        description: 'Admin sẽ xem xét và phản hồi trong thời gian sớm nhất.',
        duration: 5000,
      });

      // Invalidate và refetch dữ liệu bài đăng
      queryClient.invalidateQueries({ queryKey: ['post', post.id] });

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
    if (confirm('Bạn có chắc chắn muốn gửi yêu cầu kiểm định cho xe/pin này?')) {
      // Store flag in localStorage to track verification request
      localStorage.setItem(`verification_requested_${post.id}`, 'true');
      requestVerificationMutation.mutate(post.id);
    }
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
    !post.isVerified &&
    !post.verificationRequestedAt;

  const canRequestAgain =
    post.status === 'PUBLISHED' &&
    !post.isVerified &&
    post.verificationRejectedAt &&
    !post.verificationRequestedAt;

  // Debug log to verify fields are now properly mapped
  console.log('RequestVerificationButton: Post verification status', {
    postId: post.id,
    status: post.status,
    isVerified: post.isVerified,
    verificationRequestedAt: post.verificationRequestedAt,
    verificationRejectedAt: post.verificationRejectedAt,
    canRequestVerification,
    canRequestAgain,
    isOwner,
    isLoggedIn,
  });

  if (!canRequestVerification && !canRequestAgain) {
    return null;
  }

  return (
    <div className={`mt-4 p-4 border rounded-lg ${canRequestAgain ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRequested ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-700 font-medium">
                Đã gửi yêu cầu kiểm định
              </span>
            </>
          ) : (
            <>
              <Shield className="h-5 w-5 text-blue-600" />
              <span className={`font-medium ${canRequestAgain ? 'text-orange-700' : 'text-blue-700'}`}>
                {canRequestAgain ? 'Gửi lại yêu cầu kiểm định' : 'Yêu cầu kiểm định xe/pin'}
              </span>
            </>
          )}
        </div>

        {!isRequested && (
          <Button
            onClick={handleRequestVerification}
            disabled={requestVerificationMutation.isPending}
            className={`text-white ${canRequestAgain ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            size="sm"
          >
            {requestVerificationMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang gửi...
              </>
            ) : (
              'Gửi yêu cầu'
            )}
          </Button>
        )}
      </div>

      <p className={`text-sm mt-2 ${canRequestAgain ? 'text-orange-600' : 'text-gray-600'}`}>
        {isRequested
          ? 'Yêu cầu kiểm định của bạn đã được gửi đến admin. Chúng tôi sẽ xem xét và phản hồi trong thời gian sớm nhất.'
          : canRequestAgain
          ? 'Yêu cầu kiểm định trước đó đã bị từ chối. Bạn có thể gửi lại yêu cầu sau khi khắc phục các vấn đề được chỉ ra.'
          : 'Yêu cầu kiểm định để nâng uy tín hàng hóa của bạn.'
        }
      </p>
    </div>
  );
}


