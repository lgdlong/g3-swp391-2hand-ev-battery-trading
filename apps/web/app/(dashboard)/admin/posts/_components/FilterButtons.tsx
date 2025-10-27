'use client';

import { Button } from '@/components/ui/button';
import { PostStatus } from '@/types/api/post';
import { Shield } from 'lucide-react';

export type AdminPostFilter = PostStatus | 'VERIFICATION_PENDING' | 'VERIFICATION_REJECTED';

interface FilterButtonsProps {
  currentFilter: AdminPostFilter;
  onFilterChange: (filter: AdminPostFilter) => void;
  counts: {
    draftCount: number;
    pendingReviewCount: number;
    publishedCount: number;
    rejectedCount: number;
    verificationRequestsCount?: number;
    verificationRejectedCount?: number;
  };
}

export function FilterButtons({ currentFilter, onFilterChange, counts }: FilterButtonsProps) {
  const { draftCount, pendingReviewCount, publishedCount, rejectedCount, verificationRequestsCount = 0, verificationRejectedCount = 0 } = counts;

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
        variant={currentFilter === 'VERIFICATION_PENDING' ? 'default' : 'outline'}
        onClick={() => onFilterChange('VERIFICATION_PENDING')}
        className={`${currentFilter === 'VERIFICATION_PENDING' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border-blue-300 text-blue-700 hover:bg-blue-50'} flex items-center gap-2`}
      >
        <Shield className="w-4 h-4" />
        Yêu cầu kiểm định ({verificationRequestsCount})
      </Button>
      <Button
        variant={currentFilter === 'VERIFICATION_REJECTED' ? 'default' : 'outline'}
        onClick={() => onFilterChange('VERIFICATION_REJECTED')}
        className={`${currentFilter === 'VERIFICATION_REJECTED' ? 'bg-red-600 text-white hover:bg-red-700' : 'border-red-300 text-red-700 hover:bg-red-50'} flex items-center gap-2`}
      >
        <Shield className="w-4 h-4" />
        Từ chối kiểm định ({verificationRejectedCount})
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
