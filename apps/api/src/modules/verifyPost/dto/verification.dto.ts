import { IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationStatus } from '../entities/post-verification-request.entity';
import { BasePostResponseDto } from '../../posts/dto/base-post-response.dto';
import { VerificationRequestResponseDto } from './verification-request-response.dto';

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
