/**
 * Utility functions for battery posts
 */

/**
 * Display a value with fallback to 'N/A'
 */
export function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }
  return String(value);
}

/**
 * Format Vietnamese currency
 */
export function formatVnd(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 'N/A';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
}

/**
 * Convert string value to number
 */
export function toNumberValue(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Convert unknown value to string
 */
export function toStringValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}
