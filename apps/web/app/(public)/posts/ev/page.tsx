'use client';
import { useMemo, useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCarPostsWithQuery, getBikePostsWithQuery, searchPosts } from '@/lib/api/postApi';
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
  const [appliedFilters, setAppliedFilters] = useState<any>({});

  // Breadcrumb function reference
  const setSubcategoryRef = useRef<((subcategory: string) => void) | null>(null);

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
    queryKey: ['searchPosts', query, location, sort],
    queryFn: async () => {
      if (!query) return [];
      return await searchPosts(query, {
        provinceNameCached: location || undefined,
        limit: 100,
        order: sort === 'newest' ? 'DESC' : sort === 'price-asc' ? 'ASC' : 'DESC',
      });
    },
    enabled: shouldUseSearch, // Only run when there's a search query
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch car posts from API (only when not searching)
  const {
    data: carPosts = [],
    isLoading: isLoadingCars,
    error: carError,
  } = useQuery({
    queryKey: ['carPosts', sort],
    queryFn: async () => {
      const queryParams = {
        offset: 0,
        limit: 50,
        order: (sort === 'newest' ? 'DESC' : sort === 'price-asc' ? 'ASC' : 'DESC') as
          | 'ASC'
          | 'DESC',
        sort: sort === 'newest' ? 'createdAt' : 'priceVnd',
        status: 'PUBLISHED' as const,
      };
      return await getCarPostsWithQuery(queryParams);
    },
    enabled: !shouldUseSearch, // Only fetch when not searching
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch bike posts from API (only when not searching)
  const {
    data: bikePosts = [],
    isLoading: isLoadingBikes,
    error: bikeError,
  } = useQuery({
    queryKey: ['bikePosts', sort],
    queryFn: async () => {
      const queryParams = {
        offset: 0,
        limit: 50,
        order: (sort === 'newest' ? 'DESC' : sort === 'price-asc' ? 'ASC' : 'DESC') as
          | 'ASC'
          | 'DESC',
        sort: sort === 'newest' ? 'createdAt' : 'priceVnd',
        status: 'PUBLISHED' as const,
      };
      return await getBikePostsWithQuery(queryParams);
    },
    enabled: !shouldUseSearch, // Only fetch when not searching
    staleTime: 5 * 60 * 1000, // 5 minutes
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
        case '<300':
          data = data.filter((p) => {
            const rangeKm = p.carDetails?.range_km || p.bikeDetails?.range_km;
            const range = parseFloat(rangeKm?.toString() || '0');
            return range > 0 && range < 300; // Chỉ hiển thị post có range > 0 và < 300
          });
          break;
        case '300-600':
          data = data.filter((p) => {
            const rangeKm = p.carDetails?.range_km || p.bikeDetails?.range_km;
            const range = parseFloat(rangeKm?.toString() || '0');
            return range >= 300 && range <= 600;
          });
          break;
        case '>600':
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
        case '<30':
          data = data.filter((p) => (p as any).batteryCapacityKWh < 30);
          break;
        case '30-50':
          data = data.filter(
            (p) => (p as any).batteryCapacityKWh >= 30 && (p as any).batteryCapacityKWh <= 50,
          );
          break;
        case '50-70':
          data = data.filter(
            (p) => (p as any).batteryCapacityKWh > 50 && (p as any).batteryCapacityKWh <= 70,
          );
          break;
        case '70-100':
          data = data.filter(
            (p) => (p as any).batteryCapacityKWh > 70 && (p as any).batteryCapacityKWh <= 100,
          );
          break;
        case '>100':
          data = data.filter((p) => (p as any).batteryCapacityKWh > 100);
          break;
      }
      console.log('After capacity filtering, data length:', data.length);
    }

    if (appliedFilters.cycles) {
      switch (appliedFilters.cycles) {
        case '<1000':
          data = data.filter((p) => (p as any).cyclesUsed < 1000);
          break;
        case '1000-2000':
          data = data.filter((p) => (p as any).cyclesUsed >= 1000 && (p as any).cyclesUsed <= 2000);
          break;
        case '2000-3000':
          data = data.filter((p) => (p as any).cyclesUsed > 2000 && (p as any).cyclesUsed <= 3000);
          break;
        case '3000-4000':
          data = data.filter((p) => (p as any).cyclesUsed > 3000 && (p as any).cyclesUsed <= 4000);
          break;
        case '>4000':
          data = data.filter((p) => (p as any).cyclesUsed > 4000);
          break;
      }
    }

    if (appliedFilters.health) {
      switch (appliedFilters.health) {
        case 'excellent':
          data = data.filter((p) => (p as any).batteryHealthPct >= 90);
          break;
        case 'very-good':
          data = data.filter(
            (p) => (p as any).batteryHealthPct >= 80 && (p as any).batteryHealthPct < 90,
          );
          break;
        case 'good':
          data = data.filter(
            (p) => (p as any).batteryHealthPct >= 70 && (p as any).batteryHealthPct < 80,
          );
          break;
        case 'fair':
          data = data.filter(
            (p) => (p as any).batteryHealthPct >= 60 && (p as any).batteryHealthPct < 70,
          );
          break;
        case 'poor':
          data = data.filter((p) => (p as any).batteryHealthPct < 60);
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
  }, [allEvPosts, location, brand, min, max, sort, appliedFilters]);

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
