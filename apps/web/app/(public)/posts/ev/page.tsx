'use client';
import { useMemo, useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCarPostsWithQuery, getBikePostsWithQuery, searchPosts } from '@/lib/api/postApi';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FilterButtons } from '@/components/breadcrumb-filter';
import { LoadingGrid, EmptyState, PageHeader, PostGrid, toStringValue } from './_components';
import { usePostOrdersFilter, filterPostsByOrderStatus } from '@/hooks/usePostOrdersFilter';

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

const FILTER_RANGES = {
  RANGE_UNDER_300: '<300',
  RANGE_300_600: '300-600',
  RANGE_OVER_600: '>600',
} as const;

const BATTERY_CAPACITY_RANGES = {
  UNDER_30: '<30',
  RANGE_30_50: '30-50',
  RANGE_50_70: '50-70',
  RANGE_70_100: '70-100',
  OVER_100: '>100',
} as const;

const CYCLES_RANGES = {
  UNDER_1000: '<1000',
  RANGE_1000_2000: '1000-2000',
  RANGE_2000_3000: '2000-3000',
  RANGE_3000_4000: '3000-4000',
  OVER_4000: '>4000',
} as const;

const HEALTH_RANGES = {
  EXCELLENT: 'excellent',
  VERY_GOOD: 'very-good',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
} as const;

const HEALTH_THRESHOLDS = {
  EXCELLENT_MIN: 90,
  VERY_GOOD_MIN: 80,
  VERY_GOOD_MAX: 90,
  GOOD_MIN: 70,
  GOOD_MAX: 80,
  FAIR_MIN: 60,
  FAIR_MAX: 70,
  POOR_MAX: 60,
} as const;

function EvPostsContent() {
  const [sort, setSort] = useState<SortKey>(SORT_OPTIONS.NEWEST);
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [brand, setBrand] = useState('');
  const [min, setMin] = useState<number | null>(null);
  const [max, setMax] = useState<number | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<any>({});

  // Breadcrumb function reference
  const setSubcategoryRef = useRef<((subcategory: string) => void) | null>(null);

  // Get post IDs that should be excluded based on order statuses
  const excludedPostIds = usePostOrdersFilter();

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    // Support both 'loc' and 'location' params for backward compatibility
    setLocation(searchParams.get('location') || searchParams.get('loc') || '');
    setBrand(searchParams.get('brand') || '');
    const minParam = searchParams.get('min');
    const maxParam = searchParams.get('max');
    setMin(minParam ? Number(minParam) : null);
    setMax(maxParam ? Number(maxParam) : null);
  }, [searchParams]);

  // Use search API when query exists, otherwise fetch regular posts
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
      const response = await getCarPostsWithQuery(queryParams);
      console.log('Car posts response:', response);

      // Check for duplicates
      const postIds = response.map((post: any) => post.id);
      const uniqueIds = [...new Set(postIds)];
      if (postIds.length !== uniqueIds.length) {
        console.warn('Duplicate posts detected!', {
          total: postIds.length,
          unique: uniqueIds.length,
          duplicates: postIds.filter((id, index) => postIds.indexOf(id) !== index)
        });
      }

      return response;
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

  // Client-side filtering (additional filtering beyond API)
  const filtered = useMemo(() => {
    let data = [...allEvPosts];

    // Filter out posts that have orders with statuses: PROCESSING, COMPLETED, CANCELLED, DISPUTE
    data = filterPostsByOrderStatus(data, excludedPostIds);

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
      data = data.filter((p) => parseFloat((p as any).priceVnd || '0') >= min);
    }
    if (max !== null) {
      data = data.filter((p) => parseFloat((p as any).priceVnd || '0') <= max);
    }

    // Apply new filter system
    console.log('Applied filters:', appliedFilters);
    if (appliedFilters.status) {
      data = data.filter((p) => (p as any).status === appliedFilters.status);
    }

    if (appliedFilters.priceMin !== undefined) {
      data = data.filter((p) => parseFloat((p as any).priceVnd || '0') >= appliedFilters.priceMin);
    }
    if (appliedFilters.priceMax !== undefined) {
      data = data.filter((p) => parseFloat((p as any).priceVnd || '0') <= appliedFilters.priceMax);
    }

    if (appliedFilters.range) {
      switch (appliedFilters.range) {
        case FILTER_RANGES.RANGE_UNDER_300:
          data = data.filter((p) => {
            const rangeKm = p.carDetails?.range_km || p.bikeDetails?.range_km;
            const range = parseFloat(rangeKm?.toString() || '0');
            return range > 0 && range < 300; // Chỉ hiển thị post có range > 0 và < 300
          });
          break;
        case FILTER_RANGES.RANGE_300_600:
          data = data.filter((p) => {
            const rangeKm = p.carDetails?.range_km || p.bikeDetails?.range_km;
            const range = parseFloat(rangeKm?.toString() || '0');
            return range >= 300 && range <= 600;
          });
          break;
        case FILTER_RANGES.RANGE_OVER_600:
          data = data.filter((p) => {
            const rangeKm = p.carDetails?.range_km || p.bikeDetails?.range_km;
            const range = parseFloat(rangeKm?.toString() || '0');
            return range > 600;
          });
          break;
      }
    }

    if (appliedFilters.capacity) {
      console.log('Filtering by capacity:', appliedFilters.capacity);
      switch (appliedFilters.capacity) {
        case BATTERY_CAPACITY_RANGES.UNDER_30:
          data = data.filter((p) => (p as any).batteryCapacityKWh < 30);
          break;
        case BATTERY_CAPACITY_RANGES.RANGE_30_50:
          data = data.filter(
            (p) => (p as any).batteryCapacityKWh >= 30 && (p as any).batteryCapacityKWh <= 50,
          );
          break;
        case BATTERY_CAPACITY_RANGES.RANGE_50_70:
          data = data.filter(
            (p) => (p as any).batteryCapacityKWh > 50 && (p as any).batteryCapacityKWh <= 70,
          );
          break;
        case BATTERY_CAPACITY_RANGES.RANGE_70_100:
          data = data.filter(
            (p) => (p as any).batteryCapacityKWh > 70 && (p as any).batteryCapacityKWh <= 100,
          );
          break;
        case BATTERY_CAPACITY_RANGES.OVER_100:
          data = data.filter((p) => (p as any).batteryCapacityKWh > 100);
          break;
      }
      console.log('After capacity filtering, data length:', data.length);
    }

    if (appliedFilters.cycles) {
      switch (appliedFilters.cycles) {
        case CYCLES_RANGES.UNDER_1000:
          data = data.filter((p) => (p as any).cyclesUsed < 1000);
          break;
        case CYCLES_RANGES.RANGE_1000_2000:
          data = data.filter((p) => (p as any).cyclesUsed >= 1000 && (p as any).cyclesUsed <= 2000);
          break;
        case CYCLES_RANGES.RANGE_2000_3000:
          data = data.filter((p) => (p as any).cyclesUsed > 2000 && (p as any).cyclesUsed <= 3000);
          break;
        case CYCLES_RANGES.RANGE_3000_4000:
          data = data.filter((p) => (p as any).cyclesUsed > 3000 && (p as any).cyclesUsed <= 4000);
          break;
        case CYCLES_RANGES.OVER_4000:
          data = data.filter((p) => (p as any).cyclesUsed > 4000);
          break;
      }
    }

    if (appliedFilters.health) {
      switch (appliedFilters.health) {
        case HEALTH_RANGES.EXCELLENT:
          data = data.filter((p) => (p as any).batteryHealthPct >= HEALTH_THRESHOLDS.EXCELLENT_MIN);
          break;
        case HEALTH_RANGES.VERY_GOOD:
          data = data.filter(
            (p) =>
              (p as any).batteryHealthPct >= HEALTH_THRESHOLDS.VERY_GOOD_MIN &&
              (p as any).batteryHealthPct < HEALTH_THRESHOLDS.VERY_GOOD_MAX,
          );
          break;
        case HEALTH_RANGES.GOOD:
          data = data.filter(
            (p) =>
              (p as any).batteryHealthPct >= HEALTH_THRESHOLDS.GOOD_MIN &&
              (p as any).batteryHealthPct < HEALTH_THRESHOLDS.GOOD_MAX,
          );
          break;
        case HEALTH_RANGES.FAIR:
          data = data.filter(
            (p) =>
              (p as any).batteryHealthPct >= HEALTH_THRESHOLDS.FAIR_MIN &&
              (p as any).batteryHealthPct < HEALTH_THRESHOLDS.FAIR_MAX,
          );
          break;
        case HEALTH_RANGES.POOR:
          data = data.filter((p) => (p as any).batteryHealthPct < HEALTH_THRESHOLDS.POOR_MAX);
          break;
      }
    }

    if (appliedFilters.batteryBrand) {
      data = data.filter((p) =>
        (p as any).batteryBrand?.toLowerCase().includes(appliedFilters.batteryBrand.toLowerCase()),
      );
    }

    if (appliedFilters.brand) {
      data = data.filter((p) =>
        (p as any).title?.toLowerCase().includes(appliedFilters.brand.toLowerCase()),
      );
    }

    // Apply sorting
    if (appliedFilters.sortBy === 'newest') {
      data.sort(
        (a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime(),
      );
    } else {
      switch (sort) {
        case 'price-asc':
          data.sort(
            (a, b) =>
              parseFloat((a as any).priceVnd || '0') - parseFloat((b as any).priceVnd || '0'),
          );
          break;
        case 'price-desc':
          data.sort(
            (a, b) =>
              parseFloat((b as any).priceVnd || '0') - parseFloat((a as any).priceVnd || '0'),
          );
          break;
        default:
          data.sort(
            (a, b) => ((b as any).manufactureYear || 0) - ((a as any).manufactureYear || 0),
          );
      }
    }

    return data;
  }, [allEvPosts, location, brand, min, max, sort, appliedFilters, excludedPostIds]);

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
