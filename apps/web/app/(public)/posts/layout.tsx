import React from 'react';
import { Navbar } from '@/components/navbar';
import { SearchBar } from '@/components/searchbar';

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <SearchBar />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </>
  );
}
