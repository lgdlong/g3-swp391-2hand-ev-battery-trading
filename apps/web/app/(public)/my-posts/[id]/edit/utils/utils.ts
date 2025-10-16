import { FlexibleField } from '@/types/post';

/**
 * Utility function to extract string value from FlexibleField
 */
export function getFlexibleFieldValue(field: FlexibleField | undefined): string {
  if (field === null || field === undefined) return '';
  if (typeof field === 'string' || typeof field === 'number') {
    return field.toString();
  }
  if (typeof field === 'object' && field !== null && 'value' in field) {
    return field.value?.toString() || '';
  }
  return '';
}

/**
 * Utility function to extract number value from FlexibleField
 */
export function getFlexibleFieldNumber(field: FlexibleField | undefined): number | undefined {
  if (field === null || field === undefined) return undefined;
  if (typeof field === 'number') return field;
  if (typeof field === 'string') {
    const num = parseFloat(field);
    return isNaN(num) ? undefined : num;
  }
  if (typeof field === 'object' && field !== null && 'value' in field) {
    if (typeof field.value === 'number') return field.value;
    if (typeof field.value === 'string') {
      const num = parseFloat(field.value);
      return isNaN(num) ? undefined : num;
    }
  }
  return undefined;
}
