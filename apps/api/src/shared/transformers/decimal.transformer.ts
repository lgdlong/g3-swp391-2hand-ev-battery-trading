import { ValueTransformer } from 'typeorm';

/**
 * Transformer for decimal/numeric columns in PostgreSQL
 * Converts string to number when reading from DB
 * and number to string when writing to DB
 */
export class DecimalTransformer implements ValueTransformer {
  to(value: number | null | undefined): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    return value.toString();
  }

  from(value: string | null | undefined): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
}
