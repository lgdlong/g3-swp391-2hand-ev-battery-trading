'use client';

import { Suspense } from 'react';
import { ComparePageClient } from './_components/ComparePageClient';

function ComparePageWrapper() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-6">Đang tải...</div>}>
      <ComparePageClient />
    </Suspense>
  );
}

export default function ComparePage() {
  return <ComparePageWrapper />;
}
