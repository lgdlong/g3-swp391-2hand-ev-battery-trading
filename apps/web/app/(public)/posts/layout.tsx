import React from 'react';
import { Header } from '@/components/header';
import { SearchBar } from '@/components/search-bar';

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <SearchBar />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </>
  );
}
