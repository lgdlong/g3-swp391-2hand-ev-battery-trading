import { ApiProperty } from '@nestjs/swagger';

/**
 * Daily Revenue Item DTO
 * Represents revenue for a single day
 */
export class DailyRevenueItemDto {
  @ApiProperty({
    description: 'Day of the month (1-31)',
    example: 15,
  })
  day: number;

  @ApiProperty({
    description: 'Date in YYYY-MM-DD format',
    example: '2024-11-15',
  })
  date: string;

  @ApiProperty({
    description: 'Total revenue for this day in VND',
    example: '5000000',
  })
  revenue: string;

  @ApiProperty({
    description: 'Number of transactions on this day',
    example: 25,
  })
  transactionCount: number;
}

/**
 * Monthly Daily Revenue Response DTO
 * Contains daily revenue breakdown for a specific month
 */
export class MonthlyDailyRevenueDto {
  @ApiProperty({
    description: 'Year (YYYY)',
    example: 2024,
  })
  year: number;

  @ApiProperty({
    description: 'Month (1-12)',
    example: 11,
  })
  month: number;

  @ApiProperty({
    description: 'Total revenue for the entire month',
    example: '150000000',
  })
  totalMonthRevenue: string;

  @ApiProperty({
    description: 'Total number of transactions in the month',
    example: 750,
  })
  totalTransactions: number;

  @ApiProperty({
    description: 'Daily revenue breakdown',
    type: [DailyRevenueItemDto],
  })
  dailyRevenue: DailyRevenueItemDto[];
}
