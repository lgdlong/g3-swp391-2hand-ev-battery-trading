import type {
  PostUI,
  CarDetailUI,
  BikeDetailUI,
  SellerLite,
  PostImageUI,
  PostTypeUI,
  PostStatusUI,
  PostOriginUI,
} from '@/types/post';
import type { Post as PostApiResponse } from '@/lib/api/postApi';

// We'll adapt the existing API response instead of defining a new DTO type
type PostDtoRaw = PostApiResponse;
type FlexibleField = string | number | object | null | undefined;

/**
 * Safely converts flexible field to number
 */
function toNumber(value: FlexibleField): number {
  if (value === null || value === undefined) return 0;
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Safely converts flexible field to string
 */
function toString(value: FlexibleField): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

/**
 * Safely converts flexible field to string or undefined
 */
function toStringOrUndefined(value: FlexibleField): string | undefined {
  if (value === null || value === undefined) return undefined;
  const str = String(value);
  return str === 'null' || str === 'undefined' ? undefined : str;
}

/**
 * Adapts raw car details DTO to UI interface
 */
function adaptCarDetails(dto: PostDtoRaw['carDetails']): CarDetailUI | undefined {
  if (!dto) return undefined;

  return {
    manufacture_year: toNumber(dto.manufacture_year),
    odo_km: toNumber(dto.odo_km),
    battery_capacity_kwh: toString(dto.battery_capacity_kwh),
    battery_health_pct: toString(dto.battery_health_pct),
    charge_ac_kw: dto.charge_ac_kw ? toString(dto.charge_ac_kw) : undefined,
    charge_dc_kw: dto.charge_dc_kw ? toString(dto.charge_dc_kw) : undefined,
    range_km: dto.range_km ? toNumber(dto.range_km) : undefined,
    license_plate: dto.license_plate ? toString(dto.license_plate) : undefined,
    origin: dto.origin as PostOriginUI | undefined,
  };
}

/**
 * Adapts raw bike details DTO to UI interface
 */
function adaptBikeDetails(dto: PostDtoRaw['bikeDetails']): BikeDetailUI | undefined {
  if (!dto) return undefined;

  return {
    manufacture_year: toNumber(dto.manufacture_year),
    odo_km: toNumber(dto.odo_km),
    battery_capacity_kwh: toString(dto.battery_capacity_kwh),
    battery_health_pct: toString(dto.battery_health_pct),
    motor_power_kw: dto.motor_power_kw ? toString(dto.motor_power_kw) : undefined,
    range_km: dto.range_km ? toNumber(dto.range_km) : undefined,
    license_plate: dto.license_plate ? toString(dto.license_plate) : undefined,
    origin: dto.origin as PostOriginUI | undefined,
  };
}

/**
 * Adapts raw images array to UI interface
 */
function adaptImages(images: FlexibleField[] | undefined): PostImageUI[] {
  if (!images) return [];

  return images
    .map((img): PostImageUI | undefined => {
      if (!img) return undefined;
      // API may return string URL or object with url field
      if (typeof img === 'string') {
        return { url: img };
      }
      if (typeof img === 'object' && 'url' in img) {
        const anyImg = img as { url?: unknown; publicId?: unknown };
        const url = typeof anyImg.url === 'string' ? anyImg.url : undefined;
        if (url) return { url };
      }
      return undefined;
    })
    .filter((x): x is PostImageUI => !!x);
}

/**
 * Adapts raw seller DTO to UI interface
 */
function adaptSeller(seller: PostDtoRaw['seller']): SellerLite {
  return {
    id: seller?.id || 0,
    fullName: seller?.fullName || 'Người dùng',
  };
}

/**
 * Main adapter function: converts raw post DTO to UI interface
 * @param dto Raw post data from API
 * @returns Normalized PostUI object
 */
export function adaptPostDto(dto: PostDtoRaw): PostUI {
  return {
    id: dto.id,
    postType: dto.postType as PostTypeUI,
    title: dto.title,
    description: dto.description,
    priceVnd: dto.priceVnd,
    isNegotiable: dto.isNegotiable,
    status: dto.status as PostStatusUI,
    provinceNameCached: toStringOrUndefined(dto.provinceNameCached),
    districtNameCached: toStringOrUndefined(dto.districtNameCached),
    wardNameCached: toStringOrUndefined(dto.wardNameCached),
    addressTextCached: toStringOrUndefined(dto.addressTextCached),
    seller: adaptSeller(dto.seller),
    carDetails: adaptCarDetails(dto.carDetails),
    bikeDetails: adaptBikeDetails(dto.bikeDetails),
    images: adaptImages(dto.images),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    submittedAt: toStringOrUndefined(dto.submittedAt),
    reviewedAt: toStringOrUndefined(dto.reviewedAt),
  };
}
