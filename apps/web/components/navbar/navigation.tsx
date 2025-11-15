'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Exact match for home page
    if (href === '/') {
      return pathname === '/';
    }
    // Check if pathname starts with href for other routes
    return pathname.startsWith(href);
  };

  return (
    <nav className={cn('flex items-center space-x-10', className)}>
      {navigationItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            'relative text-sm font-semibold transition-all duration-300 group px-4 py-3 rounded-xl',
            isActive(item.href)
              ? 'text-[#048C73]'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <span className="relative z-10">{item.label}</span>
          <div
            className={cn(
              'absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-[#048C73] rounded-full transition-all duration-400',
              isActive(item.href)
                ? 'w-3/4'
                : 'w-0 group-hover:w-3/4'
            )}
          />
        </Link>
      ))}
    </nav>
  );
}
