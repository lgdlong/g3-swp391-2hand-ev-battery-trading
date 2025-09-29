import React from 'react';

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </>
  );
}
