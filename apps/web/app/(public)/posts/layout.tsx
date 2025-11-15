'use client';

import React from 'react';
import { SearchBar } from '@/components/searchbar';

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SearchBar />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </>
  );
}
