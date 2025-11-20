# Verification UI Components - Q&A

## Question: Create UI Components for Post Verification Feature

**Prompt:**
Tôi cần tạo các UI components để hiển thị trạng thái kiểm định và cho phép user yêu cầu kiểm định bài đăng. Các components cần:
- VerificationBadge để hiển thị "Đã kiểm định"
- RequestVerificationButton để yêu cầu kiểm định
- Hiển thị các trạng thái khác nhau (pending, approved, rejected)

**Answer:**

### 1. VerificationBadge Component

```typescript
// apps/web/components/VerificationBadge.tsx
import { Badge } from '@/components/ui/badge';
import { BadgeCheckIcon } from 'lucide-react';

interface VerificationBadgeProps {
  className?: string;
}

export function VerificationBadge({ className = '' }: VerificationBadgeProps) {
  return (
    <Badge variant="secondary" className={`bg-blue-500 text-white dark:bg-blue-600 ${className}`}>
      <BadgeCheckIcon className="h-4 w-4 mr-1" />
      Đã kiểm định
    </Badge>
  );
}
```

**Usage:**
```typescript
{post.verificationRequest?.status === 'APPROVED' && <VerificationBadge />}
```

**Key Features:**
- ✅ Hiển thị badge "Đã kiểm định" với icon check
- ✅ Màu xanh dương (blue-500) để nổi bật
- ✅ Support dark mode
- ✅ Customizable className

### 2. RequestVerificationButton Component

```typescript
// apps/web/app/(public)/my-posts/_components/RequestVerificationButton.tsx
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
  const isOwner = isLoggedIn && user && user.id == post.seller.id;

  // Mutation để gửi yêu cầu kiểm định
  const requestVerificationMutation = useMutation({
    mutationFn: (postId: string) => {
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
      queryClient.invalidateQueries({ queryKey: ['carPosts'] });
      queryClient.invalidateQueries({ queryKey: ['bikePosts'] });
      queryClient.invalidateQueries({ queryKey: ['batteryPosts'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'me'] });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Vui lòng thử lại sau.';
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
    toast.success('Yêu cầu kiểm định đã được gửi.');
  };

  // Chỉ hiển thị nút nếu user là owner và đã đăng nhập
  if (!isOwner || !isLoggedIn) {
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
    post.status === 'PUBLISHED' && post.verificationRequest?.status === 'PENDING';

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
```

### 3. Button States

**State 1: Can Request Verification (First Time)**
- Button màu xanh dương (bg-blue-600)
- Text: "Yêu cầu kiểm định"
- Icon: Shield
- Hiển thị khi: post.status === 'PUBLISHED' && !post.verificationRequest

**State 2: Can Request Again (After Rejection)**
- Button màu cam (bg-orange-600)
- Text: "Yêu cầu kiểm định"
- Icon: Shield
- Hiển thị khi: post.verificationRequest?.status === 'REJECTED'

**State 3: Pending Verification**
- Button màu vàng (bg-yellow-50)
- Text: "Đang chờ kiểm định"
- Icon: Clock
- Disabled state
- Hiển thị khi: post.verificationRequest?.status === 'PENDING'

**State 4: Already Verified**
- Không hiển thị button
- Hiển thị VerificationBadge thay thế
- Khi: post.verificationRequest?.status === 'APPROVED'

### 4. Integration with PaymentDialog

```typescript
<PaymentDialog
  open={showPaymentDialog}
  onOpenChange={setShowPaymentDialog}
  postTitle={post.title}
  postId={post.id}
  postImage={post.images?.[0]?.url}
  isRetry={!!canRequestAgain}
  onPaymentSuccess={handlePaymentSuccess}
/>
```

### Key Features:
- ✅ **Owner Check**: Chỉ owner mới thấy button
- ✅ **Status-based Display**: Hiển thị khác nhau theo trạng thái
- ✅ **Payment Integration**: Tích hợp với PaymentDialog
- ✅ **Loading States**: Hiển thị loading khi đang gửi
- ✅ **Error Handling**: Toast notifications cho errors
- ✅ **Cache Invalidation**: Tự động refresh data sau khi thành công
- ✅ **Retry Support**: Cho phép gửi lại sau khi bị từ chối

### Usage in Post List:

```typescript
// apps/web/app/(public)/my-posts/_components/post-list-item.tsx
{post.status === 'PUBLISHED' && <RequestVerificationButton post={post as any} />}
{post.verificationRequest?.status === 'APPROVED' && <VerificationBadge />}
```

### Usage in Post Detail:

```typescript
// apps/web/app/(public)/posts/ev/[id]/page.tsx
{post.verificationRequest?.status === 'APPROVED' && <VerificationBadge />}
```

