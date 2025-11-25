/**
 * Form Data Type Definitions for Post Creation
 *
 * This file contains all form data interfaces used across the post creation feature.
 * Using composition pattern to allow flexible extension and avoid tight coupling.
 */

import { BatteryChemistry, Origin } from './enums';

// ============================================================================
// POST TYPE
// ============================================================================

export type PostType = 'ev' | 'battery';

// ============================================================================
// COMMON FORM FIELDS
// ============================================================================

/**
 * Common fields shared by all post types (EV, Battery, etc.)
 */
export interface CommonFormFields {
  title: string;
  description: string;
  priceVnd: string;
  addressText: string;
  addressTextCached: string;
  wardCode: string;
  provinceNameCached: string;
  districtNameCached: string;
  wardNameCached: string;
  isNegotiable: boolean;
}

// ============================================================================
// EV-SPECIFIC FORM FIELDS
// ============================================================================

/**
 * EV-specific fields for car and bike posts
 */
export interface EvFormData {
  vehicleType: 'xe_hoi' | 'xe_may';
  brandId: string;
  modelId: string;
  manufactureYear: string;
  bodyStyle: 'SEDAN' | 'SUV' | 'HATCHBACK' | 'COUPE' | 'OTHER';
  bikeStyle: 'SCOOTER' | 'UNDERBONE' | 'MOTORCYCLE' | 'MOPED' | 'OTHER';
  color: 'BLACK' | 'WHITE' | 'RED' | 'BLUE' | 'SILVER';
  seats: string;
  trimName: string;
  licensePlate: string;
  ownersCount: string;
  odoKm: string;
  batteryCapacityKwh: string;
  chargeAcKw: string;
  chargeDcKw: string;
  motorPowerKw: string;
  batteryHealthPct: string;
  hasBundledBattery: boolean;
}

// ============================================================================
// BATTERY-SPECIFIC FORM FIELDS
// ============================================================================

/**
 * Battery-specific fields for battery posts
 * Synced with backend CreateBatteryDetailsDto
 */
export interface BatteryFormData {
  brand_id: string;
  voltageV: string;
  capacityAh: string;
  chargeTimeHours: string;
  chemistry: BatteryChemistry | '';
  origin: Origin;
  weightKg: string;
  cycleLife: string;
  rangeKm: string;
  compatibleNotes: string;
}

// ============================================================================
// COMBINED FORM DATA
// ============================================================================

/**
 * Combined FormData interface using composition pattern
 *
 * Includes all fields from:
 * - CommonFormFields (shared by all post types)
 * - EvFormData (EV-specific fields)
 * - BatteryFormData (Battery-specific fields)
 *
 * Explicitly declares overlapping fields to resolve type conflicts:
 * - origin: Used by both EV and Battery
 * - rangeKm: Used by both EV and Battery
 */
export interface FormData extends CommonFormFields, EvFormData, BatteryFormData {
  // Resolve type conflicts by explicitly declaring shared fields
  origin: Origin; // Used by both EV and Battery
  rangeKm: string; // Used by both EV and Battery
}

// ============================================================================
// INITIAL FORM DATA
// ============================================================================

/**
 * Initial/default values for the form
 */
export const initialFormData: FormData = {
  // Common fields
  title: '',
  description: '',
  priceVnd: '',
  addressText: '',
  addressTextCached: '',
  wardCode: '',
  provinceNameCached: '',
  districtNameCached: '',
  wardNameCached: '',
  isNegotiable: false,

  // EV specific fields
  vehicleType: 'xe_hoi',
  brandId: '',
  modelId: '',
  manufactureYear: '',
  bodyStyle: 'SEDAN',
  bikeStyle: 'SCOOTER',
  origin: Origin.NOI_DIA,
  color: 'BLACK',
  seats: '',
  trimName: '',
  licensePlate: '',
  ownersCount: '',
  odoKm: '',
  batteryCapacityKwh: '',
  rangeKm: '',
  chargeAcKw: '',
  chargeDcKw: '',
  motorPowerKw: '',
  batteryHealthPct: '',
  hasBundledBattery: false,

  // Battery specific fields (from BatteryFormData)
  brand_id: '',
  voltageV: '',
  capacityAh: '',
  chargeTimeHours: '',
  chemistry: '',
  weightKg: '',
  cycleLife: '',
  compatibleNotes: '',
};
