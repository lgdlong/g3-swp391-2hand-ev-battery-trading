'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
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

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  postTitle?: string;
  isSubmitting?: boolean;
}

/**
 * RatingModal - Modal để đánh giá bài post sau khi mua
 * - Hiển thị 5 sao để chọn rating (0-5)
 * - Textarea lớn để nhập bình luận
 * - Submit rating về backend
 */
export function RatingModal({
  isOpen,
  onClose,
  onSubmit,
  postTitle,
  isSubmitting = false,
}: RatingModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  const handleSubmit = () => {
    if (rating === 0) {
      // Có thể thêm toast warning ở đây
      return;
    }
    onSubmit(rating, comment);
  };

  const handleClose = () => {
    // Reset state khi đóng modal
    setRating(0);
    setHoveredRating(0);
    setComment('');
    onClose();
  };

  return (
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
  );
}
