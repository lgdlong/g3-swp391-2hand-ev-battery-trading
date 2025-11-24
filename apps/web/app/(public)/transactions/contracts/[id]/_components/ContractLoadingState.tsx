'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ContractLoadingState() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative bg-[#1a2332] text-white overflow-hidden">
        <div className="relative container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-64 bg-white/20" />
        </div>
      </section>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

