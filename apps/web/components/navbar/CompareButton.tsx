'use client';

import React from 'react';
import Link from 'next/link';
import { Scale } from 'lucide-react';
import { useComparison } from '@/hooks/useComparison';

export function CompareButton() {
  const { count } = useComparison();

  return (
    <Link
      href="/compare"
      className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 group"
      title="So sánh sản phẩm"
    >
      <Scale className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
          {count}
        </span>
      )}
    </Link>
  );
}
