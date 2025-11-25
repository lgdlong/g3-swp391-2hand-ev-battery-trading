/**
 * Constants for Fee Tier settings
 * Centralized configuration to avoid hard-coding values
 */

export const FEE_TIER_PRICE_CONSTANTS = {
  /** Minimum price for fee tier slider (1 million VND) */
  MIN_PRICE: 1_000_000,
  /** Maximum price for fee tier slider (10 billion VND) */
  MAX_PRICE: 10_000_000_000,
  /** Step size for price slider (1 million VND) */
  STEP: 1_000_000,
} as const;

export const FEE_TIER_DEPOSIT_RATE_CONSTANTS = {
  /** Minimum deposit rate percentage */
  MIN: 0,
  /** Maximum deposit rate percentage */
  MAX: 100,
  /** Step size for deposit rate input (allows 0.001 precision) */
  STEP: 0.001,
} as const;

