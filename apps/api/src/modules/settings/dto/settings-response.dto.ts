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
