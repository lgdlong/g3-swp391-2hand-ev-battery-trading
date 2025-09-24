'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <Link href="#" className={cn('flex items-center gap-2', className)}>
      {/* Battery Icon */}
      <div className={cn(
        'bg-[#048C73] rounded-xl flex items-center justify-center text-white font-bold shadow-sm',
        'hover:shadow-md transition-all duration-200 hover:scale-105',
        sizeClasses[size]
      )}>
        <svg
          className="w-2/3 h-2/3"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M15.67 4H14V2c0-.55-.45-1-1-1s-1 .45-1 1v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM11 20v-5.5H9L13 7v5.5h2L11 20z"/>
        </svg>
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <span className="font-bold text-xl leading-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">2Hand</span>
        <span className="text-xs text-gray-500 leading-tight font-medium">EV Battery</span>
      </div>
    </Link>
  );
}
