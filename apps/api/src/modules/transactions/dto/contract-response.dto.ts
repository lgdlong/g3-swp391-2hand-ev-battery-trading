import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContractStatus } from '../../../shared/enums/contract-status.enum';

export class ContractResponseDto {
  @ApiProperty({ description: 'ID của hợp đồng' })
  id!: string;

  @ApiProperty({ description: 'ID của bài đăng' })
  listingId!: string;

  @ApiProperty({ description: 'ID của người mua' })
  buyerId!: number;

  @ApiProperty({ description: 'ID của người bán' })
  sellerId!: number;

  @ApiProperty({
    enum: ContractStatus,
    description: 'Trạng thái hợp đồng',
  })
  status!: ContractStatus;

  @ApiProperty({ description: 'Đánh dấu giao dịch bán ngoài hệ thống' })
  isExternalTransaction!: boolean;

  @ApiPropertyOptional({
    description: 'Thời điểm buyer xác nhận',
    nullable: true,
  })
  buyerConfirmedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Thời điểm seller xác nhận',
    nullable: true,
  })
  sellerConfirmedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Thời điểm cả hai bên xác nhận',
    nullable: true,
  })
  confirmedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Đường dẫn file hợp đồng',
    nullable: true,
  })
  filePath?: string | null;

  @ApiPropertyOptional({
    description: 'Snapshot của bài đăng khi tạo hợp đồng',
    nullable: true,
  })
  listingSnapshot?: Record<string, any> | null;

  @ApiPropertyOptional({
    description: 'Tỷ lệ phí',
    nullable: true,
  })
  feeRate?: string | null;

  @ApiProperty({ description: 'Thời gian tạo' })
  createdAt!: Date;

  @ApiProperty({ description: 'Thời gian cập nhật' })
  updatedAt!: Date;
}


