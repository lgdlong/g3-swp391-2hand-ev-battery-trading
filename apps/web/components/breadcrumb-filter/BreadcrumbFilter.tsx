'use client';

import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from './types';

interface BreadcrumbFilterProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbFilter({ items, className }: BreadcrumbFilterProps) {
  if (items.length === 0) return null;

  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)}>
      <button
        onClick={() => window.location.href = '/'}
        className="hover:text-gray-700 transition-colors duration-200"
      >
        <Home className="h-4 w-4 text-gray-500" />
      </button>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className={cn(
                "font-medium px-2 py-1 rounded-md transition-colors duration-200 hover:bg-gray-50",
                index === items.length - 1
                  ? "text-gray-600 bg-gray-100" // Item cuối cùng (đã chọn) - màu xám với background
                  : "text-gray-900 hover:text-gray-700" // Item bình thường có thể click
              )}
            >
              {item.label}
            </button>
          ) : (
            <span className={cn(
              "font-medium px-2 py-1 rounded-md transition-colors duration-200",
              index === items.length - 1
                ? "text-gray-600 bg-gray-100" // Item cuối cùng (đã chọn) - màu xám với background
                : "text-gray-900" // Item bình thường
            )}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
