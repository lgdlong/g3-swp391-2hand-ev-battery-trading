'use client';
import { useMemo, useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCarPostsWithQuery, getBikePostsWithQuery, searchPosts } from '@/lib/api/postApi';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FilterButtons } from '@/components/breadcrumb-filter';
import { LoadingGrid, EmptyState, PageHeader, PostGrid } from './_components';
import {
  filterByLocation,
  filterByPrice,
  filterByBrand,
  filterByAppliedFilters,
  sortPosts,
  type EVAppliedFilters,
} from './utils/filterUtils';

type SortKey = 'newest' | 'price-asc' | 'price-desc';

// Constants
const QUERY_KEYS = {
  CAR_POSTS: 'carPosts',
  BIKE_POSTS: 'bikePosts',
  SEARCH_POSTS: 'searchPosts',
} as const;

const POST_STATUS = {
  PUBLISHED: 'PUBLISHED',
} as const;

const PAGINATION = {
  CAR_BIKE_LIMIT: 50,
  SEARCH_LIMIT: 100,
  OFFSET: 0,
} as const;

const CACHE_TIME = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
} as const;

const SORT_OPTIONS = {
  NEWEST: 'newest',
  PRICE_ASC: 'price-asc',
  PRICE_DESC: 'price-desc',
} as const;

function EvPostsContent() {
  const [sort, setSort] = useState<SortKey>(SORT_OPTIONS.NEWEST);
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [brandId, setBrandId] = useState<number | null>(null);
  const [min, setMin] = useState<number | null>(null);
  const [max, setMax] = useState<number | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<EVAppliedFilters>({});
  const [searchPostType, setSearchPostType] = useState<string | null>(null);

  // Breadcrumb function reference
  const setSubcategoryRef = useRef<((subcategory: string) => void) | null>(null);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    // Support both 'loc' and 'location' params for backward compatibility
    setLocation(searchParams.get('location') || searchParams.get('loc') || '');
    const brandParam = searchParams.get('brandId');
    setBrandId(brandParam ? Number(brandParam) : null);
    const minParam = searchParams.get('min');
    const maxParam = searchParams.get('max');
    setMin(minParam ? Number(minParam) : null);
    setMax(maxParam ? Number(maxParam) : null);

    // Read postType from URL to know which types to search
    const postTypeParam = searchParams.get('postType');
    setSearchPostType(postTypeParam);
  }, [searchParams]);

  // Use search API when query exists, otherwise fetch regular posts
  const shouldUseSearch = !!query;

  // Search posts when query exists
  const {
    data: searchResults = [],
    isLoading: isLoadingSearch,
    error: searchError,
  } = useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, query, location, sort, searchPostType],
    queryFn: async () => {
      if (!query) return [];

      // When searching from EV page (postType='EV'), search both CAR and BIKE
      if (searchPostType === 'EV') {
        const [carResults, bikeResults] = await Promise.all([
          searchPosts(query, {
            provinceNameCached: location || undefined,
            postType: 'EV_CAR',
            limit: PAGINATION.SEARCH_LIMIT,
            order: sort === 'newest' ? 'DESC' : sort === 'price-asc' ? 'ASC' : 'DESC',
          }),
          searchPosts(query, {
            provinceNameCached: location || undefined,
            postType: 'EV_BIKE',
            limit: PAGINATION.SEARCH_LIMIT,
            order: sort === 'newest' ? 'DESC' : sort === 'price-asc' ? 'ASC' : 'DESC',
          }),
        ]);
        return [...carResults, ...bikeResults];
      }

      // For other pages or no specific postType, search all
      return await searchPosts(query, {
        provinceNameCached: location || undefined,
        limit: PAGINATION.SEARCH_LIMIT,
        order: sort === 'newest' ? 'DESC' : sort === 'price-asc' ? 'ASC' : 'DESC',
      });
    },
    enabled: shouldUseSearch, // Only run when there's a search query
    staleTime: CACHE_TIME.STALE_TIME, // 5 minutes
  });

  // Fetch car posts from API (only when not searching)
  const {
    data: carPosts = [],
    isLoading: isLoadingCars,
    error: carError,
  } = useQuery({
    queryKey: [QUERY_KEYS.CAR_POSTS, sort],
    queryFn: async () => {
      const queryParams = {
        offset: 0,
        limit: PAGINATION.CAR_BIKE_LIMIT,
        order: (sort === 'newest' ? 'DESC' : sort === 'price-asc' ? 'ASC' : 'DESC') as
          | 'ASC'
          | 'DESC',
        sort: sort === 'newest' ? 'createdAt' : 'priceVnd',
        status: POST_STATUS.PUBLISHED,
      };
      return await getCarPostsWithQuery(queryParams);
    },
    enabled: !shouldUseSearch, // Only fetch when not searching
    staleTime: CACHE_TIME.STALE_TIME, // 5 minutes
  });

  // Fetch bike posts from API (only when not searching)
  const {
    data: bikePosts = [],
    isLoading: isLoadingBikes,
    error: bikeError,
  } = useQuery({
    queryKey: [QUERY_KEYS.BIKE_POSTS, sort],
    queryFn: async () => {
      const queryParams = {
        offset: 0,
        limit: PAGINATION.CAR_BIKE_LIMIT,
        order: (sort === 'newest' ? 'DESC' : sort === 'price-asc' ? 'ASC' : 'DESC') as
          | 'ASC'
          | 'DESC',
        sort: sort === 'newest' ? 'createdAt' : 'priceVnd',
        status: POST_STATUS.PUBLISHED,
      };
      return await getBikePostsWithQuery(queryParams);
    },
    enabled: !shouldUseSearch, // Only fetch when not searching
    staleTime: CACHE_TIME.STALE_TIME, // 5 minutes
  });

  // Combine loading states and errors
  const isLoading = shouldUseSearch ? isLoadingSearch : isLoadingCars || isLoadingBikes;

  // Handle API errors
  useEffect(() => {
    if (searchError && shouldUseSearch) {
      toast.error('Không thể tìm kiếm. Vui lòng thử lại.');
      console.error('Error searching posts:', searchError);
    }
    if (carError && !shouldUseSearch) {
      toast.error('Không thể tải danh sách xe điện. Vui lòng thử lại.');
      console.error('Error fetching car posts:', carError);
    }
    if (bikeError && !shouldUseSearch) {
      toast.error('Không thể tải danh sách xe máy điện. Vui lòng thử lại.');
      console.error('Error fetching bike posts:', bikeError);
    }
  }, [carError, bikeError, searchError, shouldUseSearch]);

  // Combine car and bike posts, or use search results
  const allEvPosts = useMemo(() => {
    if (shouldUseSearch) {
      return searchResults;
    }
    return [...carPosts, ...bikePosts];
  }, [carPosts, bikePosts, searchResults, shouldUseSearch]);

  // Client-side filtering using modular filter utilities
  const filtered = useMemo(() => {
    let data = [...allEvPosts];

    // Apply location filter (from URL params)
    if (location) {
      data = filterByLocation(data, location);
    }

    // Apply legacy URL param filters (brand ID, price)
    if (brandId) {
      data = filterByBrand(data, brandId);
    }

    if (min !== null || max !== null) {
      data = filterByPrice(data, min ?? undefined, max ?? undefined);
    }

    // Apply filters from FilterButtons component (appliedFilters)
    data = filterByAppliedFilters(data, appliedFilters);

    // Apply sorting
    const sortKey = appliedFilters.sortBy || sort;
    data = sortPosts(data, sortKey);

    return data;
  }, [allEvPosts, location, brandId, min, max, sort, appliedFilters]); // Loading state
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
        onFilterChange={setAppliedFilters}
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
