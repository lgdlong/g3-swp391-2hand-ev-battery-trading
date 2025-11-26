'use client';

import { Button } from '@/components/ui/button';
import { PostStatus } from '@/types/api/post';

export type AdminPostFilter = PostStatus;

interface FilterButtonsProps {
  currentFilter: AdminPostFilter;
  onFilterChange: (filter: AdminPostFilter) => void;
  counts: {
    pendingReviewCount: number;
    publishedCount: number;
    rejectedCount: number;
  };
}

export function FilterButtons({ currentFilter, onFilterChange, counts }: FilterButtonsProps) {
  const filters: { key: AdminPostFilter; label: string; badge: number }[] = [
    { key: 'PENDING_REVIEW', label: 'Chờ duyệt', badge: counts.pendingReviewCount },
    { key: 'PUBLISHED', label: 'Đã đăng', badge: counts.publishedCount },
    { key: 'REJECTED', label: 'Từ chối', badge: counts.rejectedCount },
  ];

  return (
    <div className="flex gap-3 mb-6 flex-wrap justify-start">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          variant={currentFilter === filter.key ? 'default' : 'outline'}
          onClick={() => onFilterChange(filter.key)}
          className={currentFilter === filter.key ? 'bg-black text-white' : ''}
        >
          {filter.label} ({filter.badge})
        </Button>
      ))}
    </div>
  );
}
