'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Post } from '@/types/post';
import type { ComparisonItem } from '@/types/comparison';

export function useComparison() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get selected IDs from URL
  const selectedIdsFromUrl = useMemo(() => {
    const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];
    return new Set(ids);
  }, [searchParams]);

  const [items, setItems] = useState<ComparisonItem[]>([]);

  // Add item to comparison
  const addItem = useCallback((post: Post, type: 'CAR' | 'BIKE' | 'BATTERY') => {
    setItems((prev) => {
      // Check if already exists
      if (prev.some((item) => item.id === post.id)) {
        return prev;
      }
      return [
        ...prev,
        {
          id: post.id,
          type,
          post,
        },
      ];
    });

    // Update URL
    const newIds = [...selectedIdsFromUrl, post.id];
    router.push(`/compare?ids=${newIds.join(',')}`);
  }, [selectedIdsFromUrl, router]);

  // Remove item from comparison
  const removeItem = useCallback((postId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== postId));

    // Update URL
    const newIds = Array.from(selectedIdsFromUrl).filter((id) => id !== postId);
    if (newIds.length > 0) {
      router.push(`/compare?ids=${newIds.join(',')}`);
    } else {
      router.push('/compare');
    }
  }, [selectedIdsFromUrl, router]);

  // Clear all
  const clearAll = useCallback(() => {
    setItems([]);
    router.push('/compare');
  }, [router]);

  // Check if item is selected
  const isSelected = useCallback((postId: string) => {
    return selectedIdsFromUrl.has(postId) || items.some((item) => item.id === postId);
  }, [selectedIdsFromUrl, items]);

  // Get count
  const count = useMemo(() => items.length || selectedIdsFromUrl.size, [items, selectedIdsFromUrl]);

  return {
    items,
    selectedIds: selectedIdsFromUrl,
    addItem,
    removeItem,
    clearAll,
    isSelected,
    count,
  };
}
