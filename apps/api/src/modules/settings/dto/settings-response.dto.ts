import { ApiProperty } from '@nestjs/swagger';

export class FeeTierResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 0 })
  minPrice!: number;

  @ApiProperty({ example: 10000000, nullable: true })
  maxPrice!: number | null;

  @ApiProperty({ example: 0.1 })
  depositRate!: number;

  @ApiProperty({ example: true })
  active!: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt!: Date;
}

export class RefundPolicyResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1.0, nullable: true })
  cancelEarlyRate!: number | null;

  @ApiProperty({ example: 0.7, nullable: true })
  cancelLateRate!: number | null;

  @ApiProperty({ example: 0.5, nullable: true })
  expiredRate!: number | null;

  @ApiProperty({ example: 0.0, nullable: true })
  fraudSuspectedRate!: number | null;

  @ApiProperty({ example: 7, nullable: true })
  cancelEarlyDaysThreshold!: number | null;

  @ApiProperty({ example: 7, nullable: true })
  cancelLateDaysThreshold!: number | null;

  @ApiProperty({ example: 3, nullable: true })
  holdDays!: number | null;

  @ApiProperty({ example: 30, nullable: true })
  autoRefundAfterDays!: number | null;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt!: Date;
}

export class PostLifecycleResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 30, nullable: true })
  expirationDays!: number | null;

  @ApiProperty({ example: false, nullable: true })
  autoApprove!: boolean | null;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt!: Date;
}
