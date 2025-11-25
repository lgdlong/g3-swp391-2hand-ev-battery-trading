'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useComparison } from '@/hooks/useComparison';

export function CompareButton() {
  const { count } = useComparison();
  const pathname = usePathname();
  const isActive = pathname === '/compare';

  return (
    <Link
      href="/compare"
      className={cn(
        'relative text-sm font-semibold transition-all duration-300 group px-4 py-3 rounded-xl',
        isActive
          ? 'text-[#048C73]'
          : 'text-gray-600 hover:text-gray-900'
      )}
      title="So sánh sản phẩm"
    >
      <span className="relative z-10">So sánh</span>
      <div
        className={cn(
          'absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-[#048C73] rounded-full transition-all duration-400',
          isActive
            ? 'w-3/4'
            : 'w-0 group-hover:w-3/4'
        )}
      />
    </Link>
  );
}
