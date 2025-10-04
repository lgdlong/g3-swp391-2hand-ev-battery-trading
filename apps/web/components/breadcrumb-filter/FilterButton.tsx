'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FilterButtonProps {
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  hasDropdown?: boolean;
  hasInfo?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function FilterButton({
  label,
  icon,
  isActive,
  hasDropdown,
  hasInfo,
  onClick,
  children
}: FilterButtonProps) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium',
          isActive
            ? 'border-red-500 text-red-500 bg-red-50' // Nút "Bộ lọc" - màu đỏ
            : 'border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
        )}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{label}</span>
        {hasDropdown && (
          <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
        {hasInfo && (
          <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8h.01" />
          </svg>
        )}
      </button>
      {children && (
        <div className="absolute top-full left-0 mt-1 z-50">
          {children}
        </div>
      )}
    </div>
  );
}
