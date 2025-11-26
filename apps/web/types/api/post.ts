/**
 * API Types for Post-related endpoints
 * Request DTOs and response wrappers for post API
 */

import type {
  PostStatus,
  PostType,
  Post,
  CarDetail,
  BikeDetail,
  BatteryDetail,
  FlexibleField,
} from '@/types/post';

// Re-export commonly used types for convenience
export type { PostStatus, PostType, Post, FlexibleField };

// Alias for backward compatibility
export type CarDetails = CarDetail;
export type BikeDetails = BikeDetail;
export type BatteryDetails = BatteryDetail;

// ===== Request DTOs =====

export interface CreatePostDto {
  postType: PostType;
  title: string;
  description: string;
  wardCode: string;
  addressText: string;
  priceVnd: number;
  isNegotiable: boolean;
  carDetails?: Partial<CarDetail>;
  bikeDetails?: Partial<BikeDetail>;
  batteryDetails?: Partial<BatteryDetail>;
}

export interface CreateCarPostDto {
  postType: 'EV_CAR';
  title: string;
  description: string;
  wardCode: string;
  provinceNameCached: string;
  districtNameCached: string;
  wardNameCached: string;
  addressTextCached: string;
  priceVnd: string;
  isNegotiable: boolean;
  carDetails: {
    brand_id?: number;
    model_id?: number;
    manufacture_year: number;
    body_style?: string;
    origin: string;
    color: string;
    seats: number;
    license_plate: string;
    owners_count: number;
    odo_km: number;
    battery_capacity_kwh: number;
    range_km: number;
    charge_ac_kw: number;
    charge_dc_kw: number;
    battery_health_pct: number;
  };
}

export interface CreateBikePostDto {
  postType: 'EV_BIKE';
  title: string;
  description: string;
  wardCode: string;
  provinceNameCached: string;
  districtNameCached: string;
  wardNameCached: string;
  addressTextCached: string;
  priceVnd: string;
  isNegotiable: boolean;
  bikeDetails: {
    brand_id?: number;
    model_id?: number;
    manufacture_year: number;
    bike_style?: string;
    origin: string;
    color: string;
    license_plate: string;
    owners_count: number;
    odo_km: number;
    battery_capacity_kwh: number;
    range_km: number;
    motor_power_kw: number;
    charge_ac_kw: number;
    battery_health_pct: number;
    has_bundled_battery?: boolean;
    is_original_battery?: boolean;
  };
}

export interface CreateBatteryPostDto {
  postType: 'BATTERY';
  title: string;
  description: string;
  wardCode: string;
  provinceNameCached: string;
  districtNameCached: string;
  wardNameCached: string;
  addressTextCached: string;
  priceVnd: string;
  isNegotiable: boolean;
  batteryDetails: {
    brand_id?: number;
    voltageV: number;
    capacityAh: number;
    chargeTimeHours: number;
    chemistry?: string;
    origin?: string;
    weightKg: number;
    cycleLife: number;
    rangeKm: number;
    compatibleNotes?: string;
  };
}

export interface UpdatePostDto extends Partial<CreatePostDto> {
  status?: PostStatus;
}

// ===== Query Parameters =====

export interface GetPostsQuery {
  q?: string;
  offset?: number;
  limit?: number;
  order?: 'ASC' | 'DESC';
  sort?: string;
  page?: number;
  postType?: PostType;
  status?: PostStatus | 'ALL';
}

// ===== Response Types =====

export interface PostsResponse {
  data: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PostCountResponse {
  total: number;
  byStatus: Record<PostStatus, number>;
}

export interface DeletePostResponse {
  message: string;
  deletedAt: string;
}

export interface ArchivePostResponse {
  success: boolean;
  postId: string;
  newStatus: PostStatus;
  message: string;
}
