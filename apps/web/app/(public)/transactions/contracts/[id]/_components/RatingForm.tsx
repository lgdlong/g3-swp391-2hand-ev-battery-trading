'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { submitRating } from '@/lib/api/ratingApi';
import type { CreateRatingDto } from '@/types/rating';

interface RatingFormProps {
  postId: string;
  onSuccess?: () => void;
}

export function RatingForm({ postId, onSuccess }: RatingFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [content, setContent] = useState<string>('');
  const queryClient = useQueryClient();

  const submitRatingMutation = useMutation({
    mutationFn: (data: CreateRatingDto) => submitRating(postId, data),
    onSuccess: () => {
      toast.success('Đánh giá thành công!');
      queryClient.invalidateQueries({ queryKey: ['ratings', postId] });
      queryClient.invalidateQueries({ queryKey: ['ratingStatus', postId] });
      queryClient.invalidateQueries({ queryKey: ['myGivenRatings'] });
      setRating(0);
      setContent('');
      setHoveredRating(0);
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(errorMessage || 'Có lỗi xảy ra khi đánh giá');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }
    submitRatingMutation.mutate({
      rating,
      content: content.trim() || undefined,
    });
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-lg">Đánh giá sản phẩm</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div>
            <Label className="mb-2 block">Đánh giá của bạn *</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  {rating === 1
                    ? 'Rất tệ'
                    : rating === 2
                      ? 'Tệ'
                      : rating === 3
                        ? 'Bình thường'
                        : rating === 4
                          ? 'Tốt'
                          : 'Rất tốt'}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content" className="mb-2 block">
              Nhận xét (tùy chọn)
            </Label>
            <Textarea
              id="content"
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              maxLength={1000}
              className="resize-none"
            />
            <p className="mt-1 text-xs text-gray-500 text-right">{content.length}/1000 ký tự</p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-[#048C73] text-white hover:bg-[#048C73]/90 disabled:opacity-50"
            disabled={submitRatingMutation.isPending || rating === 0}
          >
            {submitRatingMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
