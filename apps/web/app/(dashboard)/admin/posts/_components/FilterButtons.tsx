'use client';

import { Button } from '@/components/ui/button';
import { PostStatus } from '@/types/api/post';

interface FilterButtonsProps {
  currentFilter: PostStatus;
  onFilterChange: (filter: PostStatus) => void;
  counts: {
    draftCount: number;
    pendingReviewCount: number;
    publishedCount: number;
    rejectedCount: number;
  };
}

export function FilterButtons({ currentFilter, onFilterChange, counts }: FilterButtonsProps) {
  const { draftCount, pendingReviewCount, publishedCount, rejectedCount } = counts;

  return (
    <div className="flex gap-3 mb-6 flex-wrap justify-start">
      <Button
        variant={currentFilter === 'PENDING_REVIEW' ? 'default' : 'outline'}
        onClick={() => onFilterChange('PENDING_REVIEW')}
        className={currentFilter === 'PENDING_REVIEW' ? 'bg-black text-white' : ''}
      >
        Chờ duyệt ({pendingReviewCount})
      </Button>
      <Button
        variant={currentFilter === 'PUBLISHED' ? 'default' : 'outline'}
        onClick={() => onFilterChange('PUBLISHED')}
        className={currentFilter === 'PUBLISHED' ? 'bg-black text-white' : ''}
      >
        Đã đăng ({publishedCount})
      </Button>
      <Button
        variant={currentFilter === 'REJECTED' ? 'default' : 'outline'}
        onClick={() => onFilterChange('REJECTED')}
        className={currentFilter === 'REJECTED' ? 'bg-black text-white' : ''}
      >
        Từ chối ({rejectedCount})
      </Button>
    </div>
  );
}
