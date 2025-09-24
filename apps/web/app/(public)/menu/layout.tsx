import React from 'react';
import { Navbar } from '@/components/navbar';

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </>
  );
}
