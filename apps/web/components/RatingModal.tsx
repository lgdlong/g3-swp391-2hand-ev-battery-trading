'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { submitRating } from '@/lib/api/ratingApi';

interface RatingModalProps {
  postId: string; // Required - ID của post cần đánh giá
  postTitle?: string;
  buttonText?: string; // Custom button text
  onSuccess?: () => void; // Optional callback sau khi submit thành công
}

/**
 * RatingModal - Uncontrolled Modal Component để đánh giá bài post
 * - Component tự quản lý state (isOpen)
 * - Hiển thị button mở modal + modal content
 * - Tự động xử lý API call bên trong component
 * - Toast notifications cho success/error
 * 
 * @example
 * ```tsx
 * <RatingModal
 *   postId="post-123"
 *   postTitle="Pin xe máy điện VinFast"
 *   buttonText="Viết đánh giá" // Optional
 *   onSuccess={() => {
 *     // Optional: Refresh data sau khi rating thành công
 *     queryClient.invalidateQueries(['ratings', 'post-123']);
 *   }}
 * />
 * ```
 */
export function RatingModal({
  postId,
  postTitle,
  buttonText = 'Viết đánh giá',
  onSuccess,
}: RatingModalProps) {
  // Internal state - Component tự quản lý
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.warning('Vui lòng chọn số sao đánh giá');
      return;
    }

    setIsSubmitting(true);

    try {
      // 🚀 Gọi API submitRating với signature mới
      const response = await submitRating(postId, {
        rating,
        content: comment, // Backend dùng field 'content' không phải 'comment'
      });

      console.log('✅ Rating API Response:', response);

      // Toast success
      toast.success('Đánh giá thành công!', {
        description: `Bạn đã đánh giá ${rating} sao`,
        duration: 3000,
      });

      // Callback để parent refresh data nếu cần
      onSuccess?.();

      // Đóng modal và reset state
      handleClose();
    } catch (error: any) {
      console.error('❌ Rating API Error:', error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể gửi đánh giá. Vui lòng thử lại sau';

      toast.error('Có lỗi xảy ra', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state khi đóng modal
    setRating(0);
    setHoveredRating(0);
    setComment('');
    setIsOpen(false); // ← Tự update internal state
  };

  return (
    <>
      {/* Button mở modal */}
      <Button 
        onClick={() => setIsOpen(true)}
        size="lg"
        className="gap-2"
      >
        <Star className="h-5 w-5" />
        {buttonText}
      </Button>

      {/* Rating Modal */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Đánh giá sản phẩm</DialogTitle>
          <DialogDescription>
            {postTitle ? (
              <>
                Chia sẻ trải nghiệm của bạn về <strong>{postTitle}</strong>
              </>
            ) : (
              'Chia sẻ trải nghiệm của bạn về sản phẩm này'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Đánh giá của bạn</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
                  disabled={isSubmitting}
                >
                  <Star
                    className={cn(
                      'h-10 w-10 transition-colors',
                      (hoveredRating >= star || rating >= star)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-300'
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 ? `${rating}/5 sao` : 'Chưa chọn'}
              </span>
            </div>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-3">
            <Label htmlFor="comment" className="text-base font-semibold">
              Nhận xét chi tiết (tùy chọn)
            </Label>
            <Textarea
              id="comment"
              placeholder="Chia sẻ chi tiết về chất lượng sản phẩm, dịch vụ của người bán, trải nghiệm giao dịch..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[150px] resize-none"
              disabled={isSubmitting}
              maxLength={1000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {comment.length}/1000 ký tự
            </div>
          </div>

          {/* Rating Guidelines */}
          <div className="rounded-lg bg-muted/50 p-4 text-sm">
            <p className="font-semibold mb-2">Hướng dẫn đánh giá:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>⭐ 1 sao: Rất không hài lòng</li>
              <li>⭐⭐ 2 sao: Không hài lòng</li>
              <li>⭐⭐⭐ 3 sao: Bình thường</li>
              <li>⭐⭐⭐⭐ 4 sao: Hài lòng</li>
              <li>⭐⭐⭐⭐⭐ 5 sao: Rất hài lòng</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
