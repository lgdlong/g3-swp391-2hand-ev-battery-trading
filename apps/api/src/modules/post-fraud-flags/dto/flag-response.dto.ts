import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FraudFlagStatus } from '../entities/post-fraud-flag.entity';

export class FlagResponseDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: '123' })
  postId: string;

  @ApiProperty({ enum: FraudFlagStatus, example: 'SUSPECTED' })
  status: FraudFlagStatus;

  @ApiProperty({ example: 'Nghi ngờ giá quá thấp so với thị trường' })
  reason: string;

  @ApiPropertyOptional({ example: '1' })
  flaggedBy: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  flaggedAt: Date;

  @ApiPropertyOptional({ example: '2' })
  reviewedBy: string | null;

  @ApiPropertyOptional({ example: '2024-01-02T00:00:00.000Z' })
  reviewedAt: Date | null;

  @ApiProperty({ example: '2024-01-02T00:00:00.000Z' })
  updatedAt: Date;
}

export class FlaggedPostResponseDto extends FlagResponseDto {
  @ApiProperty({ example: 'Toyota Camry 2020' })
  postTitle: string;

  @ApiProperty({ example: '500000000' })
  postPrice: string;

  @ApiProperty({ example: '5' })
  sellerId: string;
}

export class PaginatedFlaggedPostsResponseDto {
  @ApiProperty({ type: [FlaggedPostResponseDto] })
  data: FlaggedPostResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}
