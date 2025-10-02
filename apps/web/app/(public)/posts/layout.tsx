'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SearchBar } from '@/components/searchbar';

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Ẩn bộ lọc cho các trang ev và battery
  const shouldShowFilters = !pathname.includes('/posts/ev') && !pathname.includes('/posts/battery');

  return (
    <>
      <SearchBar showFilters={shouldShowFilters} />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </>
  );
}
