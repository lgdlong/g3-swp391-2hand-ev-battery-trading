'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavigationProps {
  className?: string;
}

const navigationItems = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Xe điện', href: '/posts/ev' },
  { label: 'Pin', href: '/posts/batteries' },
];

export function Navigation({ className }: NavigationProps) {
  return (
    <nav className={cn('flex items-center space-x-10', className)}>
      {navigationItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="relative text-sm font-semibold text-gray-600 hover:text-gray-900 transition-all duration-300 group px-4 py-3 rounded-xl"
        >
          <span className="relative z-10">{item.label}</span>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-[#048C73] group-hover:w-3/4 transition-all duration-200 rounded-full"></div>
        </Link>
      ))}
    </nav>
  );
}
