import type {
  PostUI,
  CarDetailUI,
  BikeDetailUI,
  BatteryDetail,
  SellerLite,
  PostImageUI,
  PostType,
  PostStatus,
} from '@/types/post';
import type { Post } from '@/lib/api/postApi';
import { Origin } from '@/types/enums';

// We'll adapt the existing API response instead of defining a new DTO type
type PostDtoRaw = Post;
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
    origin: dto.origin as Origin | undefined,
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
    origin: dto.origin as Origin | undefined,
  };
}

/**
 * Adapts raw battery details DTO to UI interface
 */
function adaptBatteryDetails(dto: PostDtoRaw['batteryDetails']): BatteryDetail | undefined {
  if (!dto) return undefined;

  return {
    brandId: dto.brandId ? toNumber(dto.brandId) : null,
    voltageV: dto.voltageV ? toNumber(dto.voltageV) : null,
    capacityAh: dto.capacityAh ? toNumber(dto.capacityAh) : null,
    chargeTimeHours: dto.chargeTimeHours ? toNumber(dto.chargeTimeHours) : null,
    chemistry: dto.chemistry as 'LFP' | 'NMC' | 'NCA' | 'LMO' | 'LCO' | 'OTHER' | null,
    origin: dto.origin as 'NOI_DIA' | 'NHAP_KHAU' | null,
    weightKg: dto.weightKg ? toNumber(dto.weightKg) : null,
    cycleLife: dto.cycleLife ? toNumber(dto.cycleLife) : null,
    rangeKm: dto.rangeKm ? toNumber(dto.rangeKm) : null,
    compatibleNotes: dto.compatibleNotes ? toString(dto.compatibleNotes) : null,
  };
}

/**
 * Adapts raw images array to UI interface
 */
function adaptImages(images: FlexibleField[] | undefined): PostImageUI[] {
  if (!images) return [];

  return images
    .map((img, index): PostImageUI | undefined => {
      if (!img) return undefined;

      if (typeof img === 'string') {
        return {
          id: crypto.randomUUID(), // hoặc dùng index.toString() nếu bạn không cần unique
          url: img,
          position: index,
        };
      }

      if (typeof img === 'object' && 'url' in img) {
        const anyImg = img as { url?: unknown; publicId?: unknown };
        const url = typeof anyImg.url === 'string' ? anyImg.url : undefined;
        if (url) {
          return {
            id: (anyImg.publicId as string) ?? crypto.randomUUID(),
            url,
            position: index,
          };
        }
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
    postType: dto.postType as PostType,
    title: dto.title,
    description: dto.description,
    // wardCode: dto.wardCode,
    priceVnd: dto.priceVnd,
    isNegotiable: dto.isNegotiable,
    status: dto.status as PostStatus,

    provinceNameCached: toStringOrUndefined(dto.provinceNameCached),
    districtNameCached: toStringOrUndefined(dto.districtNameCached),
    wardNameCached: toStringOrUndefined(dto.wardNameCached),
    addressTextCached: toStringOrUndefined(dto.addressTextCached),

    seller: adaptSeller(dto.seller),
    carDetails: adaptCarDetails(dto.carDetails),
    bikeDetails: adaptBikeDetails(dto.bikeDetails),
    batteryDetails: adaptBatteryDetails(dto.batteryDetails),
    images: adaptImages(dto.images),

    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    submittedAt: toStringOrUndefined(dto.submittedAt),
    reviewedAt: toStringOrUndefined(dto.reviewedAt),
    // Verification data from relation
    verificationRequest: dto.verificationRequest
      ? {
          status: dto.verificationRequest.status as 'PENDING' | 'APPROVED' | 'REJECTED',
          requestedAt: dto.verificationRequest.requestedAt,
          reviewedAt: dto.verificationRequest.reviewedAt
            ? new Date(dto.verificationRequest.reviewedAt).toISOString()
            : undefined,
          rejectReason: dto.verificationRequest.rejectReason || undefined,
        }
      : undefined,
  };
}
