'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Scale } from 'lucide-react';
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
    <Button
      onClick={handleClick}
      variant={selected ? 'default' : 'outline'}
      className={className}
    >
      <Scale className="h-4 w-4 mr-2" />
      {selected ? 'Đã thêm so sánh' : 'Thêm so sánh'}
    </Button>
  );
}
