// types/post.ts

import { Origin } from './enums';

// ===== Core Enums (Backend-aligned) =====

/** Post type enum matching backend */
export type PostType = 'EV_CAR' | 'EV_BIKE' | 'BATTERY';

/** Post status enum matching backend */
export type PostStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'PAUSED'
  | 'SOLD'
  | 'ARCHIVED';

/** Origin type for vehicles */
export type PostOrigin = 'NOI_DIA' | 'NHAP_KHAU';

// ===== Vehicle Detail Enums =====

/** Car body style types */
export type BodyStyle = 'SEDAN' | 'HATCHBACK' | 'SUV' | 'MPV' | 'COUPE' | 'WAGON' | 'PICKUP';

/** Bike style types */
export type BikeStyle = 'SCOOTER' | 'STANDARD' | 'SPORT' | 'CRUISER';

/** Vehicle color options */
export type VehicleColor =
  | 'WHITE'
  | 'BLACK'
  | 'SILVER'
  | 'GRAY'
  | 'BLUE'
  | 'RED'
  | 'GREEN'
  | 'YELLOW'
  | 'ORANGE'
  | 'BROWN';

// Type for flexible API fields (can be string, number, object, or null)
export type FlexibleField = string | number | null | { value: string | number | null };

// ===== PostImage =====
/** Post image interface matching backend PostImageResponseDto */
export interface PostImage {
  id: string;
  publicId: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
  format?: string | null;
  position: number;
  createdAt: string;
}

export interface ImageDiffPayload {
  toDelete: string[]; // array of id or publicId to delete
  toKeep: Array<{
    id: string;
    publicId: string;
    position: number;
  }>; // existing images to keep with updated position
  toUpload: Array<{
    file: File;
    position: number;
  }>; // new images to upload
  hasMain: boolean; // whether there's a main image (position 0)
}

// ===== Seller =====
/** Seller/user information in post context */
export interface PostSeller {
  id: number;
  email: string;
  phone: string | null;
  fullName: string;
  avatarUrl: string | null;
  status: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// ===== CarDetail =====
/** Car details interface matching backend CarDetailsResponseDto */
export interface CarDetail {
  brandId: FlexibleField;
  model_id: FlexibleField;
  manufacture_year: FlexibleField;
  body_style: string;
  origin: string;
  color: string;
  seats: FlexibleField;
  license_plate: FlexibleField;
  owners_count: FlexibleField;
  odo_km: FlexibleField;
  battery_capacity_kwh: FlexibleField;
  range_km: FlexibleField;
  charge_ac_kw: FlexibleField;
  charge_dc_kw: FlexibleField;
  battery_health_pct: FlexibleField;
}

// ===== BikeDetail =====
/** Bike details interface matching backend BikeDetailsResponseDto */
export interface BikeDetail {
  brandId: FlexibleField;
  model_id: FlexibleField;
  manufacture_year: FlexibleField;
  bike_style: string;
  origin: string;
  color: string;
  license_plate: FlexibleField;
  owners_count: FlexibleField;
  odo_km: FlexibleField;
  battery_capacity_kwh: FlexibleField;
  range_km: FlexibleField;
  motor_power_kw: FlexibleField;
  charge_ac_kw: FlexibleField;
  battery_health_pct: FlexibleField;
}

// ===== BatteryDetail =====
/** Battery details interface */
export interface BatteryDetail {
  brandId: number | null;
  voltageV: number | null;
  capacityAh: number | null;
  chargeTimeHours: number | null;
  chemistry: 'LFP' | 'NMC' | 'NCA' | 'LMO' | 'LCO' | 'OTHER' | null;
  origin: 'NOI_DIA' | 'NHAP_KHAU' | null;
  weightKg: number | null;
  cycleLife: number | null;
  rangeKm: number | null;
  compatibleNotes: string | null;
}

// ===== UI-focused interfaces =====

/** Seller information in post context */
export interface SellerLite {
  id: number;
  fullName: string;
}

/** Car detail specifications for UI */
export interface CarDetailUI {
  manufacture_year: number;
  odo_km: number;
  battery_capacity_kwh: string;
  battery_health_pct: string;
  charge_ac_kw?: string;
  charge_dc_kw?: string;
  range_km?: number;
  license_plate?: string;
  origin?: Origin;
}

/** Bike detail specifications for UI */
export interface BikeDetailUI {
  manufacture_year: number;
  odo_km: number;
  battery_capacity_kwh: string;
  battery_health_pct: string;
  motor_power_kw?: string;
  range_km?: number;
  license_plate?: string;
  origin?: Origin;
}

/** Post image reference for UI */
export interface PostImageUI {
  id: string;
  url: string;
  alt?: string;
  position: number;
}

/** Main post interface for UI components */
export interface PostUI {
  id: string;
  postType: PostType;
  title: string;
  description: string;
  // wardCode: string;
  priceVnd: string;
  isNegotiable: boolean;
  status: PostStatus;

  provinceNameCached?: string;
  districtNameCached?: string;
  wardNameCached?: string;
  addressTextCached?: string;

  seller: SellerLite;
  carDetails?: CarDetailUI;
  bikeDetails?: BikeDetailUI;
  batteryDetails?: BatteryDetail;
  images: PostImageUI[];

  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  // Verification data from relation
  verificationRequest?: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedAt: string;
    reviewedAt?: string;
    rejectReason?: string;
  };
}

// ===== Main Post Interface =====
/**
 * Main post interface matching backend response
 * Used for API responses and data handling
 */
export interface Post {
  id: string;
  postType: PostType;
  title: string;
  description: string;
  wardCode: string;
  priceVnd: string;
  isNegotiable: boolean;
  status: PostStatus;

  provinceNameCached?: FlexibleField;
  districtNameCached?: FlexibleField;
  wardNameCached?: FlexibleField;
  addressTextCached?: FlexibleField;

  seller: PostSeller;
  carDetails?: CarDetail;
  bikeDetails?: BikeDetail;
  batteryDetails?: BatteryDetail;
  images: PostImage[];

  createdAt: string;
  updatedAt: string;
  submittedAt: FlexibleField;
  reviewedAt: FlexibleField;
  // Verification data from relation
  verificationRequest?: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedAt: string;
    reviewedAt?: string;
    rejectReason?: string;
  };
}

// ===== Legacy/Alternative Interfaces =====

/** @deprecated Use PostSeller instead */
export interface Seller {
  id: string | number;
  fullName?: string | null;
  avatarUrl?: string | null;
  [k: string]: unknown;
}
