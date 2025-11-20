import { Post } from '@/types/post';
import { toStringValue } from '../_components';

/**
 * Applied filters interface for EV posts
 */
export interface EVAppliedFilters {
  priceMin?: number;
  priceMax?: number;
  brandId?: number; // Brand ID for exact matching
  modelId?: string; // Model ID for exact matching
  odoKm?: string; // Odometer range string (e.g., '<1000', '1000-5000', '>100000')
  sortBy?: string;
}

/**
 * Filter by price range
 */
export function filterByPrice(posts: Post[], priceMin?: number, priceMax?: number): Post[] {
  let filtered = [...posts];

  if (priceMin !== undefined) {
    filtered = filtered.filter((post) => Number.parseFloat(post.priceVnd || '0') >= priceMin);
  }

  if (priceMax !== undefined) {
    filtered = filtered.filter((post) => Number.parseFloat(post.priceVnd || '0') <= priceMax);
  }

  return filtered;
}

/**
 * Filter by brand (title search or brand_id match)
 */
export function filterByBrand(posts: Post[], brandId?: number): Post[] {
  let filtered = [...posts];

  // Filter by exact brand_id from car/bike details
  if (brandId !== undefined && brandId !== null) {
    filtered = filtered.filter((post) => {
      const postBrandId = post.carDetails?.brand_id ?? post.bikeDetails?.brand_id ?? null;

      // Handle FlexibleField type
      if (postBrandId === null) return false;
      if (typeof postBrandId === 'number') return postBrandId === brandId;
      if (typeof postBrandId === 'string') return Number.parseInt(postBrandId, 10) === brandId;
      if (typeof postBrandId === 'object' && postBrandId.value !== null) {
        const value = postBrandId.value;
        return typeof value === 'number'
          ? value === brandId
          : Number.parseInt(String(value), 10) === brandId;
      }
      return false;
    });
  }

  return filtered;
}

/**
 * Filter by model ID
 */
export function filterByModel(posts: Post[], modelId?: string): Post[] {
  if (!modelId) return posts;

  const numericModelId = Number.parseInt(modelId, 10);
  if (Number.isNaN(numericModelId)) return posts;

  return posts.filter((post) => {
    const postModelId = post.carDetails?.model_id ?? post.bikeDetails?.model_id ?? null;

    // Handle FlexibleField type
    if (postModelId === null) return false;
    if (typeof postModelId === 'number') return postModelId === numericModelId;
    if (typeof postModelId === 'string') return Number.parseInt(postModelId, 10) === numericModelId;
    if (typeof postModelId === 'object' && postModelId.value !== null) {
      const value = postModelId.value;
      return typeof value === 'number'
        ? value === numericModelId
        : Number.parseInt(String(value), 10) === numericModelId;
    }
    return false;
  });
}

/**
 * Helper function to extract odometer value from FlexibleField
 */
function getOdoValue(
  odoKm: number | string | { value: number | string | null } | null,
): number | null {
  if (odoKm === null || odoKm === undefined) return null;

  if (typeof odoKm === 'number') return odoKm;
  if (typeof odoKm === 'string') return Number.parseFloat(odoKm);
  if (typeof odoKm === 'object' && odoKm.value !== null) {
    return Number.parseFloat(String(odoKm.value));
  }

  return null;
}

/**
 * Filter by odometer range using string format (e.g., '<1000', '1000-5000', '>100000')
 */
export function filterByOdometer(posts: Post[], odoKmRange?: string): Post[] {
  if (!odoKmRange) return posts;

  return posts.filter((post) => {
    const odoKm = post.carDetails?.odo_km ?? post.bikeDetails?.odo_km ?? null;
    const odoValue = getOdoValue(odoKm);

    if (odoValue === null) return false;

    // Handle range formats
    if (odoKmRange.startsWith('<')) {
      const max = Number.parseInt(odoKmRange.substring(1), 10);
      return odoValue < max;
    }

    if (odoKmRange.startsWith('>')) {
      const min = Number.parseInt(odoKmRange.substring(1), 10);
      return odoValue > min;
    }

    if (odoKmRange.includes('-')) {
      const [minStr, maxStr] = odoKmRange.split('-');
      if (minStr && maxStr) {
        const min = Number.parseInt(minStr, 10);
        const max = Number.parseInt(maxStr, 10);
        return odoValue >= min && odoValue <= max;
      }
    }

    return true;
  });
}

/**
 * Filter by location (province, district, ward, address)
 */
export function filterByLocation(posts: Post[], location?: string): Post[] {
  if (!location) return posts;

  const locationLower = location.toLowerCase();

  return posts.filter(
    (post) =>
      toStringValue(post.provinceNameCached).toLowerCase().includes(locationLower) ||
      toStringValue(post.districtNameCached).toLowerCase().includes(locationLower) ||
      toStringValue(post.wardNameCached).toLowerCase().includes(locationLower) ||
      toStringValue(post.addressTextCached).toLowerCase().includes(locationLower),
  );
}

/**
 * Apply all filters from appliedFilters object
 */
export function filterByAppliedFilters(posts: Post[], appliedFilters: EVAppliedFilters): Post[] {
  let filtered = [...posts];

  // Price filters
  filtered = filterByPrice(filtered, appliedFilters.priceMin, appliedFilters.priceMax);

  // Brand filters (both name search and ID match)
  filtered = filterByBrand(filtered, appliedFilters.brandId);

  // Model filter
  filtered = filterByModel(filtered, appliedFilters.modelId);

  // Odometer filter using string range
  if (appliedFilters.odoKm) {
    filtered = filterByOdometer(filtered, appliedFilters.odoKm);
  }

  return filtered;
}

/**
 * Sort posts by different criteria
 */
export function sortPosts(posts: Post[], sortBy: string): Post[] {
  const sorted = [...posts];

  switch (sortBy) {
    case 'newest':
      sorted.sort(
        (a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime(),
      );
      break;
    case 'price-asc':
      sorted.sort(
        (a, b) => Number.parseFloat(a.priceVnd || '0') - Number.parseFloat(b.priceVnd || '0'),
      );
      break;
    case 'price-desc':
      sorted.sort(
        (a, b) => Number.parseFloat(b.priceVnd || '0') - Number.parseFloat(a.priceVnd || '0'),
      );
      break;
    default:
      // Default: sort by manufacture year (newest first)
      sorted.sort((a, b) => {
        const yearA = a.carDetails?.manufacture_year ?? a.bikeDetails?.manufacture_year ?? 0;
        const yearB = b.carDetails?.manufacture_year ?? b.bikeDetails?.manufacture_year ?? 0;

        const yearValueA =
          typeof yearA === 'number'
            ? yearA
            : typeof yearA === 'string'
              ? Number.parseInt(yearA, 10)
              : typeof yearA === 'object' && yearA.value !== null
                ? Number.parseInt(String(yearA.value), 10)
                : 0;

        const yearValueB =
          typeof yearB === 'number'
            ? yearB
            : typeof yearB === 'string'
              ? Number.parseInt(yearB, 10)
              : typeof yearB === 'object' && yearB.value !== null
                ? Number.parseInt(String(yearB.value), 10)
                : 0;

        return yearValueB - yearValueA;
      });
  }

  return sorted;
}
