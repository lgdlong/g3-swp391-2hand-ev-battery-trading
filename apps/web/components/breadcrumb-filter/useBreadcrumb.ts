'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BreadcrumbState } from './types';

export function useBreadcrumb(type: 'battery' | 'ev' = 'ev') {
  const router = useRouter();

  const [breadcrumbState, setBreadcrumbState] = useState<BreadcrumbState>({
    items: [],
    currentCategory: null,
    currentSubcategory: null,
  });

  const setCategory = useCallback((category: string) => {
    setBreadcrumbState(prev => ({
      ...prev,
      currentCategory: category,
      currentSubcategory: null,
      items: [
        {
          label: category,
          onClick: () => {
            if (type === 'ev' && category === 'Xe điện') {
              router.push('/posts/ev');
            } else if (type === 'battery' && category === 'Pin EV') {
              router.push('/posts/battery');
            }
          },
        }
      ]
    }));
  }, [type, router]);

  const setSubcategory = useCallback((subcategory: string) => {
    setBreadcrumbState(prev => ({
      ...prev,
      currentSubcategory: subcategory,
      items: [
        {
          label: prev.currentCategory || 'Trang chủ',
          onClick: () => {
            if (type === 'ev' && prev.currentCategory === 'Xe điện') {
              router.push('/posts/ev');
            } else if (type === 'battery' && prev.currentCategory === 'Pin EV') {
              router.push('/posts/battery');
            }
          },
        },
        {
          label: subcategory,
        }
      ]
    }));
  }, [type, router]);

  return {
    breadcrumbState,
    setCategory,
    setSubcategory,
  };
}
