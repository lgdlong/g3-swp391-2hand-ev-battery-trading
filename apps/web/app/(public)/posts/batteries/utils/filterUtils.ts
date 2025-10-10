/**
 * Battery Posts Filtering Utilities
 * Modular functions for filtering battery posts by various criteria
 */

import type { Post } from '@/types/post';

// Types for filter configuration
export interface AppliedFilters {
  status?: string;
  priceMin?: number;
  priceMax?: number;
  capacity?: string;
  health?: string;
  cycles?: string;
  brand?: string;
  sortBy?: string;
}

export type SortKey = 'newest' | 'price-asc' | 'price-desc';

// Constants
export const SORT_OPTIONS = {
  NEWEST: 'newest',
  PRICE_ASC: 'price-asc',
  PRICE_DESC: 'price-desc',
} as const;

/**
 * Filter posts by publication status
 */
export function filterByStatus(posts: Post[]): Post[] {
  return posts.filter((post) => post.status === 'PUBLISHED');
}

/**
 * Filter posts by search query (title and description)
 */
export function filterBySearchQuery(posts: Post[], query: string): Post[] {
  if (!query.trim()) return posts;

  const searchQuery = query.trim().toLowerCase();
  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery) ||
      (post.description && post.description.toLowerCase().includes(searchQuery)),
  );
}

/**
 * Filter posts by location (province, district, address)
 */
export function filterByLocation(posts: Post[], location: string): Post[] {
  if (!location) return posts;

  return posts.filter((post) => {
    const postLocation = [post.districtNameCached, post.provinceNameCached, post.addressTextCached]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return postLocation.includes(location.toLowerCase());
  });
}

/**
 * Filter posts by brand (matches title)
 */
export function filterByBrand(posts: Post[], brand: string): Post[] {
  if (!brand) return posts;

  return posts.filter((post) => post.title.toLowerCase().includes(brand.toLowerCase()));
}

/**
 * Filter posts by minimum price
 */
export function filterByMinPrice(posts: Post[], minPrice: number | null): Post[] {
  if (minPrice === null) return posts;

  return posts.filter((post) => {
    const price = typeof post.priceVnd === 'string' ? parseFloat(post.priceVnd) : post.priceVnd;
    return price >= minPrice;
  });
}

/**
 * Filter posts by maximum price
 */
export function filterByMaxPrice(posts: Post[], maxPrice: number | null): Post[] {
  if (maxPrice === null) return posts;

  return posts.filter((post) => {
    const price = typeof post.priceVnd === 'string' ? parseFloat(post.priceVnd) : post.priceVnd;
    return price <= maxPrice;
  });
}

/**
 * Filter posts by applied filters from FilterButtons component
 */
export function filterByAppliedFilters(posts: Post[], appliedFilters: AppliedFilters): Post[] {
  let filteredPosts = [...posts];

  // Status filter
  if (appliedFilters.status) {
    filteredPosts = filteredPosts.filter((post) => post.status === appliedFilters.status);
  }

  // Price filters
  if (appliedFilters.priceMin !== undefined) {
    filteredPosts = filteredPosts.filter((post) => {
      const price = typeof post.priceVnd === 'string' ? parseFloat(post.priceVnd) : post.priceVnd;
      return price >= appliedFilters.priceMin!;
    });
  }

  if (appliedFilters.priceMax !== undefined) {
    filteredPosts = filteredPosts.filter((post) => {
      const price = typeof post.priceVnd === 'string' ? parseFloat(post.priceVnd) : post.priceVnd;
      return price <= appliedFilters.priceMax!;
    });
  }

  // Battery capacity filter
  if (appliedFilters.capacity) {
    filteredPosts = filterByCapacity(filteredPosts, appliedFilters.capacity);
  }

  // Battery health filter
  if (appliedFilters.health) {
    filteredPosts = filterByHealth(filteredPosts, appliedFilters.health);
  }

  // Battery cycles filter
  if (appliedFilters.cycles) {
    filteredPosts = filterByCycles(filteredPosts, appliedFilters.cycles);
  }

  // Brand filter
  if (appliedFilters.brand) {
    filteredPosts = filteredPosts.filter((post) =>
      post.title.toLowerCase().includes(appliedFilters.brand!.toLowerCase()),
    );
  }

  return filteredPosts;
}

/**
 * Filter posts by battery capacity ranges
 */
export function filterByCapacity(posts: Post[], capacityRange: string): Post[] {
  return posts.filter((post) => {
    const capacity = post.batteryDetails?.capacity_kwh || 0;

    switch (capacityRange) {
      case '<30':
        return capacity < 30;
      case '30-50':
        return capacity >= 30 && capacity <= 50;
      case '50-80':
        return capacity >= 50 && capacity <= 80;
      case '>80':
        return capacity > 80;
      default:
        return true;
    }
  });
}

/**
 * Filter posts by battery health percentage ranges
 */
export function filterByHealth(posts: Post[], healthRange: string): Post[] {
  return posts.filter((post) => {
    const health = post.batteryDetails?.health_percent || 0;

    switch (healthRange) {
      case '>90':
        return health > 90;
      case '80-90':
        return health >= 80 && health <= 90;
      case '70-80':
        return health >= 70 && health < 80;
      case '<70':
        return health < 70;
      default:
        return true;
    }
  });
}

/**
 * Filter posts by battery cycle count ranges
 */
export function filterByCycles(posts: Post[], cyclesRange: string): Post[] {
  return posts.filter((post) => {
    const cycles = post.batteryDetails?.cycles_used || 0;

    switch (cyclesRange) {
      case '<500':
        return cycles < 500;
      case '500-1000':
        return cycles >= 500 && cycles <= 1000;
      case '1000-2000':
        return cycles >= 1000 && cycles <= 2000;
      case '>2000':
        return cycles > 2000;
      default:
        return true;
    }
  });
}

/**
 * Sort posts by the specified criteria
 */
export function sortPosts(posts: Post[], sortKey: SortKey, appliedFilters: AppliedFilters): Post[] {
  const sortedPosts = [...posts];

  // Check if sorting is driven by applied filters
  if (appliedFilters.sortBy === 'newest') {
    return sortedPosts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  // Manual sort controls
  switch (sortKey) {
    case SORT_OPTIONS.PRICE_ASC:
      return sortedPosts.sort((a, b) => {
        const priceA = typeof a.priceVnd === 'string' ? parseFloat(a.priceVnd) : a.priceVnd;
        const priceB = typeof b.priceVnd === 'string' ? parseFloat(b.priceVnd) : b.priceVnd;
        return priceA - priceB;
      });

    case SORT_OPTIONS.PRICE_DESC:
      return sortedPosts.sort((a, b) => {
        const priceA = typeof a.priceVnd === 'string' ? parseFloat(a.priceVnd) : a.priceVnd;
        const priceB = typeof b.priceVnd === 'string' ? parseFloat(b.priceVnd) : b.priceVnd;
        return priceB - priceA;
      });

    case SORT_OPTIONS.NEWEST:
    default:
      return sortedPosts.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}

/**
 * Main function to apply all filters and sorting to posts
 */
export function filterAndSortPosts(
  posts: Post[],
  query: string,
  location: string,
  brand: string,
  min: number | null,
  max: number | null,
  sort: SortKey,
  appliedFilters: AppliedFilters,
): Post[] {
  let filteredPosts = [...posts];

  // Apply basic filters
  filteredPosts = filterByStatus(filteredPosts);
  filteredPosts = filterBySearchQuery(filteredPosts, query);
  filteredPosts = filterByLocation(filteredPosts, location);
  filteredPosts = filterByBrand(filteredPosts, brand);
  filteredPosts = filterByMinPrice(filteredPosts, min);
  filteredPosts = filterByMaxPrice(filteredPosts, max);

  // Apply advanced filters from FilterButtons
  filteredPosts = filterByAppliedFilters(filteredPosts, appliedFilters);

  // Apply sorting
  filteredPosts = sortPosts(filteredPosts, sort, appliedFilters);

  return filteredPosts;
}
