'use client';
import { useMemo, useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getBatteryPostsWithQuery, searchPosts } from '@/lib/api/postApi';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LoadingGrid, EmptyState, PostGrid } from './_components';
import { FilterButtons } from '@/components/breadcrumb-filter';
import { filterAndSortPosts, type AppliedFilters, type SortKey, SORT_OPTIONS } from './utils';
import { PostType } from '@/types/enums';

// Constants
const QUERY_KEYS = {
  BATTERY_POSTS: 'batteryPosts',
  SEARCH_POSTS: 'searchPosts',
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
    // Support both 'location' (from searchbar) and 'loc' (legacy) params
    setLocation(searchParams.get('location') || searchParams.get('loc') || '');
    setBrand(searchParams.get('brand') || '');
    const minParam = searchParams.get('min');
    const maxParam = searchParams.get('max');
    setMin(minParam ? Number(minParam) : null);
    setMax(maxParam ? Number(maxParam) : null);
  }, [searchParams]);

  // Determine if we should use search
  const shouldUseSearch = !!query;

  // Search posts when query exists
  const {
    data: searchResults = [],
    isLoading: isLoadingSearch,
    error: searchError,
  } = useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, query, location, sort],
    queryFn: async () => {
      if (!query) return [];
      return await searchPosts(query, {
        provinceNameCached: location || undefined,
        postType: PostType.BATTERY,
        limit: 50,
        order: sort === 'newest' ? 'DESC' : sort === 'price-asc' ? 'ASC' : 'DESC',
      });
    },
    enabled: shouldUseSearch,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch battery posts using TanStack Query (only when not searching)
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
    enabled: !shouldUseSearch, // Only fetch when not searching
  });

  // Handle API errors
  useEffect(() => {
    if (errorBatteryPosts && !shouldUseSearch) {
      console.error('Error loading battery posts:', batteryPostsError);
      toast.error('Không thể tải danh sách bài đăng pin. Vui lòng thử lại sau.');
    }
    if (searchError && shouldUseSearch) {
      console.error('Error searching battery posts:', searchError);
      toast.error('Không thể tìm kiếm. Vui lòng thử lại.');
    }
  }, [errorBatteryPosts, batteryPostsError, searchError, shouldUseSearch]);

  // Combine loading states
  const isLoading = shouldUseSearch ? isLoadingSearch : loadingBatteryPosts;

  // Combine battery posts or search results
  const allBatteryPosts = useMemo(() => {
    if (shouldUseSearch) {
      return searchResults;
    }
    return batteryPostsData || [];
  }, [batteryPostsData, searchResults, shouldUseSearch]);

  // Filter and sort battery posts using utility functions
  const filteredBatteryPosts = useMemo(() => {
    if (!allBatteryPosts) return [];

    return filterAndSortPosts(
      allBatteryPosts,
      query,
      location,
      brand,
      min,
      max,
      sort,
      appliedFilters,
    );
  }, [allBatteryPosts, query, location, brand, min, max, sort, appliedFilters]);

  const handleTitleClick = (title: string) => {
    // Handle title click if needed
  };

  if (isLoading) {
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
