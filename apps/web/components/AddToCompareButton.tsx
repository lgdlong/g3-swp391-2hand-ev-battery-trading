'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useComparison } from '@/hooks/useComparison';
import { toast } from 'sonner';
import type { Post } from '@/types/post';

interface AddToCompareButtonProps {
  post: Post;
  className?: string;
}

export function AddToCompareButton({ post, className }: AddToCompareButtonProps) {
  const { addItem, isSelected } = useComparison();
  const selected = isSelected(post.id);

  const handleClick = () => {
    const type = post.postType === 'EV_CAR' || post.postType === 'EV_BIKE' 
      ? (post.postType === 'EV_CAR' ? 'CAR' : 'BIKE')
      : 'BATTERY';
    addItem(post, type);
    if (!selected) {
      toast.success('Đã thêm vào so sánh', {
        description: 'Nhấp vào nút so sánh để xem chi tiết',
      });
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleClick}
        className={className || 'w-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 py-3 text-base font-normal'}
      >
        {selected ? 'Đã thêm so sánh' : 'Thêm so sánh'}
      </Button>
      <p className="text-center text-gray-600 text-sm">
        Thêm sản phẩm khác để so sánh và tìm lựa chọn tốt nhất cho bạn
      </p>
    </div>
  );
}
