import { IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationStatus } from '../entities/post-verification-request.entity';
import { BasePostResponseDto } from '../../posts/dto/base-post-response.dto';

export class RequestVerificationDto {
  @ApiPropertyOptional({
    description: 'Ghi chú thêm cho yêu cầu kiểm định',
    example: 'Xe còn mới, đầy đủ giấy tờ',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class ApproveVerificationDto {
  @ApiPropertyOptional({
    description: 'Ghi chú khi duyệt kiểm định',
    example: 'Đã kiểm tra và xác nhận thông tin',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class RejectVerificationDto {
  @ApiProperty({
    description: 'Lý do từ chối kiểm định',
    example: 'Thiếu giấy tờ chứng minh nguồn gốc xe',
  })
  @IsNotEmpty({ message: 'Reject reason is required' })
  @IsString()
  rejectReason!: string;
}

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

export class PostWithVerificationDto extends BasePostResponseDto {
  @ApiPropertyOptional({
    description: 'Thông tin yêu cầu kiểm định (nếu có)',
    type: VerificationRequestResponseDto,
    nullable: true,
  })
  verificationRequest?: VerificationRequestResponseDto;
}

export class VerificationStatusDto {
  @ApiProperty({
    enum: VerificationStatus,
    description: 'Trạng thái kiểm định',
    example: VerificationStatus.PENDING,
  })
  @IsEnum(VerificationStatus)
  status!: VerificationStatus;

  @ApiPropertyOptional({
    description: 'Lý do thay đổi trạng thái',
    example: 'Đã kiểm tra đầy đủ thông tin',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
