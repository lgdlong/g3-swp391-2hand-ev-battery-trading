// types/post.ts

// ===== UI-focused types for EV posts =====
export type PostTypeUI = 'EV_CAR' | 'EV_BIKE' | 'BATTERY';
export type PostStatusUI = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type PostOriginUI = 'NOI_DIA' | 'NHAP_KHAU';

// ===== Legacy enums (kept for backward compatibility) =====
export type PostType = 'CAR' | 'BIKE' | 'BATTERY' | string;
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'SOLD' | string;

export type BodyStyle =
  | 'SEDAN'
  | 'HATCHBACK'
  | 'SUV'
  | 'MPV'
  | 'COUPE'
  | 'WAGON'
  | 'PICKUP'
  | string;

export type BikeStyle = 'SCOOTER' | 'STANDARD' | 'SPORT' | 'CRUISER' | string;

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
  | 'BROWN'
  | string;

export type Origin = 'VIETNAM' | 'JAPAN' | 'KOREA' | 'CHINA' | 'EUROPE' | 'USA' | 'OTHER' | string;

// ===== PostImage =====
// matches PostImageResponseDto
export interface PostImage {
  id: string;
  publicId: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
  format?: string | null;
  position: number;
  createdAt: string; // ISO date string
  [k: string]: unknown; // phòng khi backend thêm trường
}

// ===== CarDetail =====
// dựa trên CarDetailsResponseDto (snake_case để khớp payload backend)
export interface CarDetail {
  brand_id: number | null;
  model_id: number | null;
  manufacture_year: number | null;

  body_style: BodyStyle | null;

  exterior_color?: VehicleColor | null;
  interior_color?: VehicleColor | null;
  origin?: Origin | null;

  // EV specs
  battery_capacity_kwh: number | null;
  range_km: number | null;
  charge_ac_kw: number | null;
  charge_dc_kw: number | null;
  battery_health_pct: number | null;

  // Bạn có thể thêm các trường khác của DTO tại đây nếu có:
  // seats?: number | null;
  // doors?: number | null;
  // mileage_km?: number | null;
  // condition?: string | null;

  [k: string]: unknown;
}

// ===== BikeDetail =====
// dựa trên BikeDetailsResponseDto (snake_case để khớp payload backend)
export interface BikeDetail {
  brand_id: number | null;
  model_id: number | null;
  manufacture_year: number | null;

  bike_style: BikeStyle | null;

  color?: VehicleColor | null;
  origin?: Origin | null;

  // EV specs
  battery_capacity_kwh: number | null;
  range_km: number | null;
  motor_power_kw: number | null;
  charge_ac_kw: number | null;
  battery_health_pct: number | null;

  [k: string]: unknown;
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
  origin?: PostOriginUI;
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
  origin?: PostOriginUI;
}

/** Post image reference for UI */
export interface PostImageUI {
  url: string;
  alt?: string;
}

/** Main post interface for UI components */
export interface PostUI {
  id: string;
  postType: PostTypeUI;
  title: string;
  description: string;
  priceVnd: string;
  isNegotiable: boolean;
  status: PostStatusUI;
  provinceNameCached?: string;
  districtNameCached?: string;
  wardNameCached?: string;
  addressTextCached?: string;
  seller: SellerLite;
  carDetails?: CarDetailUI;
  bikeDetails?: BikeDetailUI;
  images: PostImageUI[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
}

// ===== Legacy interfaces (kept for existing code) =====

// ===== Legacy interfaces (kept for existing code) =====

// SafeAccountDto (Legacy seller interface)
export interface Seller {
  id: string | number;
  fullName?: string | null;
  avatarUrl?: string | null;
  // tuỳ backend có thể trả thêm email/phone...
  [k: string]: unknown;
}

// ===== Post =====
// dựa trên BasePostResponseDto
export interface Post {
  id: string;
  postType: PostType;
  status?: PostStatus; // nếu backend có
  title?: string;
  description?: string | null;

  price?: number | null;
  currency?: string; // 'VND' | 'USD' | ...

  // liên quan vị trí / hiển thị
  location_text?: string | null;
  latitude?: number | null;
  longitude?: number | null;

  // người bán
  seller: Seller;

  // chi tiết theo loại
  carDetails?: CarDetail;
  bikeDetails?: BikeDetail;
  // batteryDetails?: BatteryDetail; // nếu sau này có

  // ảnh
  images?: PostImage[];

  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string

  [k: string]: unknown;
}
