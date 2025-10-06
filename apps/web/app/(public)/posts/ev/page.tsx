'use client';
import { useMemo, useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCarPostsWithQuery, getBikePostsWithQuery } from '@/lib/api/postApi';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FilterButtons } from '@/components/breadcrumb-filter';
import { LoadingGrid, EmptyState, PageHeader, PostGrid, toStringValue } from './_components';

type SortKey = 'newest' | 'price-asc' | 'price-desc';

function EvPostsContent() {
  const [sort, setSort] = useState<SortKey>('newest');
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [brand, setBrand] = useState('');
  const [min, setMin] = useState<number | null>(null);
  const [max, setMax] = useState<number | null>(null);

  // Breadcrumb function reference
  const setSubcategoryRef = useRef<((subcategory: string) => void) | null>(null);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setLocation(searchParams.get('loc') || '');
    setBrand(searchParams.get('brand') || '');
    const minParam = searchParams.get('min');
    const maxParam = searchParams.get('max');
    setMin(minParam ? Number(minParam) : null);
    setMax(maxParam ? Number(maxParam) : null);
  }, [searchParams]);

  // Fetch car posts from API
  const {
    data: carPosts = [],
    isLoading: isLoadingCars,
    error: carError,
  } = useQuery({
    queryKey: ['carPosts', query, location, brand, min, max, sort],
    queryFn: async () => {
      const queryParams = {
        q: query || undefined,
        offset: 0,
        limit: 50,
        order: (sort === 'newest' ? 'DESC' : sort === 'price-asc' ? 'ASC' : 'DESC') as
          | 'ASC'
          | 'DESC',
        sort: sort === 'newest' ? 'createdAt' : 'priceVnd',
        status: 'APPROVED' as const,
      };
      return await getCarPostsWithQuery(queryParams);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch bike posts from API
  const {
    data: bikePosts = [],
    isLoading: isLoadingBikes,
    error: bikeError,
  } = useQuery({
    queryKey: ['bikePosts', query, location, brand, min, max, sort],
    queryFn: async () => {
      const queryParams = {
        q: query || undefined,
        offset: 0,
        limit: 50,
        order: (sort === 'newest' ? 'DESC' : sort === 'price-asc' ? 'ASC' : 'DESC') as
          | 'ASC'
          | 'DESC',
        sort: sort === 'newest' ? 'createdAt' : 'priceVnd',
        status: 'APPROVED' as const,
      };
      return await getBikePostsWithQuery(queryParams);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Combine loading states and errors
  const isLoading = isLoadingCars || isLoadingBikes;

  // Handle API errors
  useEffect(() => {
    if (carError) {
      toast.error('Không thể tải danh sách xe điện. Vui lòng thử lại.');
      console.error('Error fetching car posts:', carError);
    }
    if (bikeError) {
      toast.error('Không thể tải danh sách xe máy điện. Vui lòng thử lại.');
      console.error('Error fetching bike posts:', bikeError);
    }
  }, [carError, bikeError]);

  // Combine car and bike posts
  const allEvPosts = useMemo(() => {
    return [...carPosts, ...bikePosts];
  }, [carPosts, bikePosts]);

  // Client-side filtering (additional filtering beyond API)
  const filtered = useMemo(() => {
    let data = [...allEvPosts];

    // Additional client-side filtering for location and brand
    if (location) {
      data = data.filter(
        (p) =>
          toStringValue(p.provinceNameCached).toLowerCase().includes(location.toLowerCase()) ||
          toStringValue(p.districtNameCached).toLowerCase().includes(location.toLowerCase()) ||
          toStringValue(p.wardNameCached).toLowerCase().includes(location.toLowerCase()) ||
          toStringValue(p.addressTextCached).toLowerCase().includes(location.toLowerCase()),
      );
    }

    if (brand) {
      data = data.filter((p) => p.title.toLowerCase().includes(brand.toLowerCase()));
    }

    // Price filtering (client-side for more precise control)
    if (min !== null) {
      data = data.filter((p) => parseFloat(p.priceVnd) >= min);
    }
    if (max !== null) {
      data = data.filter((p) => parseFloat(p.priceVnd) <= max);
    }

    return data;
  }, [allEvPosts, location, brand, min, max]);

  // Loading state
  if (isLoading) {
    return <LoadingGrid />;
  }

  return (
    <>
      <FilterButtons
        type="ev"
        initialCategory="Xe điện"
        onSubcategoryChange={(setSubcategory: (subcategory: string) => void) => {
          setSubcategoryRef.current = setSubcategory;
        }}
      />

      <div className="container mx-auto px-4 py-8">
        <PageHeader
          resultCount={filtered.length}
          isLoading={isLoading}
          sort={sort}
          onSortChange={setSort}
        />

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <PostGrid
            posts={filtered}
            onTitleClick={(title) => {
              if (setSubcategoryRef.current) {
                setSubcategoryRef.current(title);
              }
            }}
          />
        )}
      </div>
    </>
  );
}

export default function EvPostsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <EvPostsContent />
    </Suspense>
  );
}
