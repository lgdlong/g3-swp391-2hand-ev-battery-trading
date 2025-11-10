import { ApiProperty } from '@nestjs/swagger';

/**
 * Financial Overview Statistics Response DTO
 */
export class FinancialOverviewDto {
  @ApiProperty({
    description: 'Total balance across all user wallets',
    example: '50000000',
  })
  totalWalletBalance: string;

  @ApiProperty({
    description: 'Total amount topped up via PayOS',
    example: '100000000',
  })
  totalTopupAmount: string;

  @ApiProperty({
    description: 'Total amount withdrawn (future feature)',
    example: '0',
  })
  totalWithdrawalAmount: string;

  @ApiProperty({
    description: 'Total number of wallet transactions',
    example: 1234,
  })
  totalTransactions: number;

  @ApiProperty({
    description: 'Total fees collected (deposits + verifications)',
    example: '15000000',
  })
  totalFeesCollected: string;

  @ApiProperty({
    description: 'Total deposit amount collected from post payments',
    example: '12000000',
  })
  totalDepositCollected: string;

  @ApiProperty({
    description: 'Total verification fees collected',
    example: '3000000',
  })
  totalVerificationFees: string;

  @ApiProperty({
    description: 'Total amount refunded to users',
    example: '2500000',
  })
  totalRefundAmount: string;

  @ApiProperty({
    description: 'Net revenue after refunds',
    example: '12500000',
  })
  netRevenue: string;
}

/**
 * Fraud & Risk Statistics Response DTO
 */
export class FraudOverviewDto {
  @ApiProperty({
    description: 'Total number of posts flagged as fraud',
    example: 12,
  })
  totalFraudFlags: number;

  @ApiProperty({
    description: 'Number of suspected fraud posts',
    example: 8,
  })
  suspectedCount: number;

  @ApiProperty({
    description: 'Number of confirmed fraud posts',
    example: 4,
  })
  confirmedCount: number;

  @ApiProperty({
    description: 'Refund rate percentage',
    example: 15.5,
  })
  refundRate: number;

  @ApiProperty({
    description: 'Total posts with refunds processed',
    example: 45,
  })
  totalRefundedPosts: number;
}

/**
 * Transaction Statistics Response DTO
 */
export class TransactionStatsDto {
  @ApiProperty({
    description: 'Total wallet transactions',
    example: 1234,
  })
  totalTransactions: number;

  @ApiProperty({
    description: 'Transactions today',
    example: 25,
  })
  transactionsToday: number;

  @ApiProperty({
    description: 'Total post payments',
    example: 456,
  })
  totalPostPayments: number;

  @ApiProperty({
    description: 'Total topup transactions',
    example: 789,
  })
  totalTopups: number;

  @ApiProperty({
    description: 'Total verification transactions',
    example: 123,
  })
  totalVerifications: number;
}

/**
 * Complete Admin Dashboard Statistics Response DTO
 */
export class AdminDashboardStatsDto {
  @ApiProperty({
    description: 'Financial overview statistics',
    type: FinancialOverviewDto,
  })
  financial: FinancialOverviewDto;

  @ApiProperty({
    description: 'Fraud and risk statistics',
    type: FraudOverviewDto,
  })
  fraud: FraudOverviewDto;

  @ApiProperty({
    description: 'Transaction statistics',
    type: TransactionStatsDto,
  })
  transactions: TransactionStatsDto;
}
