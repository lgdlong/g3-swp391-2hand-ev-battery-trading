import React from 'react';
import { Header } from '@/components/header';

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </>
  );
}
