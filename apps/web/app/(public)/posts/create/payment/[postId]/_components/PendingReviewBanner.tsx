import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PendingReviewBannerProps {
  postId: string;
}

export function PendingReviewBanner({ postId }: PendingReviewBannerProps) {
  const router = useRouter();

  return (
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
  );
}
