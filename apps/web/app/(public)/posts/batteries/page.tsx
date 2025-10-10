'use client';
import { useMemo, useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getBatteryPostsWithQuery } from '@/lib/api/postApi';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LoadingGrid, EmptyState, PostGrid } from './_components';
import { FilterButtons } from '@/components/breadcrumb-filter';
import { filterAndSortPosts, type AppliedFilters, type SortKey, SORT_OPTIONS } from './utils';

// Constants
const QUERY_KEYS = {
  BATTERY_POSTS: 'batteryPosts',
} as const;

const POST_STATUS = {
  PUBLISHED: 'PUBLISHED',
} as const;

const PAGINATION = {
  BATTERY_LIMIT: 50,
  OFFSET: 0,
} as const;

const CACHE_TIME = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
} as const;

function BatteryPostsContent() {
  const [sort, setSort] = useState<SortKey>('newest');
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [brand, setBrand] = useState('');
  const [min, setMin] = useState<number | null>(null);
  const [max, setMax] = useState<number | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});

  // Breadcrumb function reference
  const setSubcategoryRef = useRef<((subcategory: string) => void) | null>(null);

  // Extract search parameters on mount and when they change
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setLocation(searchParams.get('loc') || '');
    setBrand(searchParams.get('brand') || '');
    const minParam = searchParams.get('min');
    const maxParam = searchParams.get('max');
    setMin(minParam ? Number(minParam) : null);
    setMax(maxParam ? Number(maxParam) : null);
  }, [searchParams]);

  // Fetch battery posts using TanStack Query
  const {
    data: batteryPostsData,
    isLoading: loadingBatteryPosts,
    isError: errorBatteryPosts,
    error: batteryPostsError,
  } = useQuery({
    queryKey: [
      QUERY_KEYS.BATTERY_POSTS,
      {
        status: POST_STATUS.PUBLISHED,
        limit: PAGINATION.BATTERY_LIMIT,
        offset: PAGINATION.OFFSET,
        order: 'DESC',
        sort: 'createdAt',
      },
    ],
    queryFn: () =>
      getBatteryPostsWithQuery({
        status: POST_STATUS.PUBLISHED,
        limit: PAGINATION.BATTERY_LIMIT,
        offset: PAGINATION.OFFSET,
        order: 'DESC',
        sort: 'createdAt',
      }),
    staleTime: CACHE_TIME.STALE_TIME,
    retry: 2,
  });

  // Handle API errors
  useEffect(() => {
    if (errorBatteryPosts) {
      console.error('Error loading battery posts:', batteryPostsError);
      toast.error('Không thể tải danh sách bài đăng pin. Vui lòng thử lại sau.');
    }
  }, [errorBatteryPosts, batteryPostsError]);

  // Filter and sort battery posts using utility functions
  const filteredBatteryPosts = useMemo(() => {
    if (!batteryPostsData) return [];

    return filterAndSortPosts(
      batteryPostsData,
      query,
      location,
      brand,
      min,
      max,
      sort,
      appliedFilters,
    );
  }, [batteryPostsData, query, location, brand, min, max, sort, appliedFilters]);

  const handleTitleClick = (title: string) => {
    console.log('Title clicked:', title);
  };

  if (loadingBatteryPosts) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingGrid />
      </div>
    );
  }

  return (
    <div>
      <FilterButtons
        type="battery"
        initialCategory="Pin EV"
        onSubcategoryChange={(setSubcategory: (subcategory: string) => void) => {
          setSubcategoryRef.current = setSubcategory;
        }}
        onFilterChange={setAppliedFilters}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Sort Controls - Simple for now */}
        <div className="mb-8 flex flex-wrap gap-4 items-center">
          <label htmlFor="sort-select" className="text-sm font-medium text-slate-700">
            Sắp xếp theo:
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
            title="Chọn cách sắp xếp bài đăng"
          >
            <option value={SORT_OPTIONS.NEWEST}>Mới nhất</option>
            <option value={SORT_OPTIONS.PRICE_ASC}>Giá thấp đến cao</option>
            <option value={SORT_OPTIONS.PRICE_DESC}>Giá cao đến thấp</option>
          </select>
        </div>

        {/* Posts Grid */}
        {filteredBatteryPosts.length === 0 ? (
          <EmptyState message="Không tìm thấy bài đăng pin nào phù hợp" />
        ) : (
          <PostGrid posts={filteredBatteryPosts} onTitleClick={handleTitleClick} />
        )}
      </div>
    </div>
  );
}

export default function BatteryPostsPage() {
  return (
    <Suspense fallback={<LoadingGrid />}>
      <BatteryPostsContent />
    </Suspense>
  );
}
