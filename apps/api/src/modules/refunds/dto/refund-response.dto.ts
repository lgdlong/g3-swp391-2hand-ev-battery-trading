import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RefundScenario } from '../../../shared/enums/refund-scenario.enum';
import { RefundStatus } from '../../../shared/enums/refund-status.enum';

/**
 * Refund response DTO
 */
export class RefundResponseDto {
  @ApiProperty({ example: '1', description: 'Refund ID' })
  id!: string;

  @ApiProperty({ example: '75', description: 'Post ID' })
  postId!: string;

  @ApiProperty({ example: 1, description: 'Account ID' })
  accountId!: number;

  @ApiProperty({
    enum: RefundScenario,
    example: RefundScenario.EXPIRED,
    description: 'Refund scenario',
  })
  scenario!: RefundScenario;

  @ApiProperty({ example: 50, description: 'Policy rate percent at time of refund' })
  policyRatePercent!: number;

  @ApiProperty({ example: '1000000', description: 'Original deposit amount (VND)' })
  amountOriginal!: string;

  @ApiProperty({ example: '500000', description: 'Actual refund amount (VND)' })
  amountRefund!: string;

  @ApiProperty({
    enum: RefundStatus,
    example: RefundStatus.PENDING,
    description: 'Refund status',
  })
  status!: RefundStatus;

  @ApiPropertyOptional({ example: '[MANUAL] User request', description: 'Refund reason' })
  reason?: string | null;

  @ApiPropertyOptional({ example: 29, description: 'Wallet transaction ID' })
  walletTransactionId?: number | null;

  @ApiPropertyOptional({
    example: '2025-11-07T10:00:00Z',
    description: 'Refund completion timestamp',
  })
  refundedAt?: Date | null;

  @ApiProperty({ example: '2025-11-07T09:00:00Z', description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ example: '2025-11-07T10:00:00Z', description: 'Last update timestamp' })
  updatedAt!: Date;
}

/**
 * Manual refund response DTO
 */
export class ManualRefundResponseDto {
  @ApiProperty({ example: true, description: 'Success status' })
  success!: boolean;

  @ApiProperty({ example: false, description: 'Dry run mode indicator' })
  dryRun!: boolean;

  @ApiProperty({ example: '10', description: 'Created refund ID' })
  refundId!: string;

  @ApiProperty({ example: '75', description: 'Post ID' })
  postId!: string;

  @ApiProperty({ example: 1, description: 'Account ID' })
  accountId!: number;

  @ApiProperty({ example: 1000000, description: 'Original deposit amount' })
  amountOriginal!: number;

  @ApiProperty({ example: 500000, description: 'Refund amount to be paid' })
  amountRefund!: number;

  @ApiProperty({ example: 50, description: 'Refund rate percent' })
  rate!: number;

  @ApiProperty({ enum: RefundScenario, example: RefundScenario.EXPIRED })
  scenario!: RefundScenario;

  @ApiProperty({ enum: RefundStatus, example: RefundStatus.PENDING })
  status!: RefundStatus;

  @ApiProperty({
    example: 'Refund request created. Use POST /refunds/:id/decide to approve or reject.',
    description: 'Status message',
  })
  message!: string;

  @ApiProperty({ example: '2025-11-07T09:00:00Z' })
  createdAt!: Date;
}

/**
 * Dry run response DTO
 */
export class DryRunResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: true })
  dryRun!: boolean;

  @ApiProperty({ example: '75' })
  postId!: string;

  @ApiProperty({ example: 1 })
  accountId!: number;

  @ApiProperty({ enum: RefundScenario, example: RefundScenario.EXPIRED })
  scenario!: RefundScenario;

  @ApiProperty({ example: 50 })
  rate!: number;

  @ApiProperty({ example: 1000000 })
  amountOriginal!: number;

  @ApiProperty({ example: 500000 })
  amountRefund!: number;

  @ApiProperty({ example: 'VND' })
  currency!: string;

  @ApiPropertyOptional({ example: 'User special request' })
  reason?: string;
}

/**
 * Admin decide refund response DTO
 */
export class AdminDecideRefundResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ enum: ['approve', 'reject'], example: 'approve' })
  decision!: string;

  @ApiProperty({ example: '10' })
  refundId!: string;

  @ApiPropertyOptional({ example: 29, description: 'Wallet transaction ID (only for approve)' })
  walletTransactionId?: number;

  @ApiPropertyOptional({ example: 500000, description: 'Refund amount (only for approve)' })
  amountRefund?: number;

  @ApiPropertyOptional({
    example: '2025-11-07T10:00:00Z',
    description: 'Refund timestamp (only for approve)',
  })
  refundedAt?: Date;

  @ApiPropertyOptional({
    example: 'Refund rejected by admin. Funds retained.',
    description: 'Message (only for reject)',
  })
  message?: string;

  @ApiPropertyOptional({ example: 'Fraud confirmed', description: 'Reason/notes' })
  reason?: string;
}

/**
 * Cron trigger response DTO
 */
export class CronTriggerResponseDto {
  @ApiProperty({ example: 10, description: 'Total posts processed' })
  processed!: number;

  @ApiProperty({ example: 8, description: 'Successfully refunded' })
  success!: number;

  @ApiProperty({ example: 2, description: 'Failed refunds' })
  failed!: number;

  @ApiPropertyOptional({
    type: [String],
    example: ['Post 123 refunded: 500000 VND', 'Post 456 refunded: 700000 VND'],
    description: 'Detailed results',
  })
  details?: string[];
}
