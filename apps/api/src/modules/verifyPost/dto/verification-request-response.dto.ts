import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationStatus } from '../entities/post-verification-request.entity';

export class VerificationRequestResponseDto {
  @ApiProperty({
    description: 'ID của bài đăng',
    example: '123',
  })
  postId!: string;

  @ApiProperty({
    description: 'ID của người yêu cầu kiểm định',
    example: 456,
  })
  requestedBy!: number;

  @ApiProperty({
    description: 'Thời gian yêu cầu kiểm định',
    example: '2025-10-16T10:30:00.000Z',
  })
  requestedAt!: Date;

  @ApiProperty({
    enum: VerificationStatus,
    description: 'Trạng thái kiểm định',
    example: VerificationStatus.PENDING,
  })
  status!: VerificationStatus;

  @ApiPropertyOptional({
    description: 'Thời gian admin xem xét',
    example: '2025-10-16T15:30:00.000Z',
    nullable: true,
  })
  reviewedAt?: Date;

  @ApiPropertyOptional({
    description: 'Lý do từ chối (nếu có)',
    example: 'Thiếu giấy tờ chứng minh',
    nullable: true,
  })
  rejectReason?: string;

  @ApiProperty({
    description: 'Thời gian tạo',
    example: '2025-10-16T10:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật',
    example: '2025-10-16T15:30:00.000Z',
  })
  updatedAt!: Date;
}

