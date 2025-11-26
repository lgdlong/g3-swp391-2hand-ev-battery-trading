import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../../shared/enums/order-status.enum';
import { Type } from 'class-transformer';

// Nested DTOs for OrderWithRelationsDto
export class OrderAccountDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  fullName!: string;

  @ApiPropertyOptional({ example: 'user@example.com', nullable: true })
  email!: string | null;

  @ApiPropertyOptional({ example: '0901234567', nullable: true })
  phone!: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', nullable: true })
  avatarUrl!: string | null;
}

export class OrderPostImageDto {
  @ApiProperty({ example: '1' })
  id!: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  url!: string;

  @ApiProperty({ example: 0 })
  position!: number;
}

export class OrderPostDto {
  @ApiProperty({ example: '123' })
  id!: string;

  @ApiProperty({ example: 'Xe điện VinFast VF8' })
  title!: string;

  @ApiProperty({ example: '50000000.00' })
  priceVnd!: string;

  @ApiProperty({ example: 'EV_CAR' })
  postType!: string;

  @ApiProperty({ type: () => [OrderPostImageDto] })
  @Type(() => OrderPostImageDto)
  images!: OrderPostImageDto[];
}

export class OrderResponseDto {
  @ApiProperty({ example: '1' })
  id!: string;

  @ApiProperty({ example: 'ORD-12345' })
  code!: string;

  @ApiProperty({ example: 1 })
  buyerId!: number;

  @ApiProperty({ example: 2 })
  sellerId!: number;

  @ApiProperty({ example: '123' })
  postId!: string;

  @ApiProperty({ example: '50000000.00' })
  amount!: string;

  @ApiProperty({ example: '2500000.00' })
  commissionFee!: string;

  @ApiProperty({ example: '47500000.00' })
  sellerReceiveAmount!: string;

  @ApiProperty({
    enum: OrderStatus,
    enumName: 'OrderStatus',
    example: 'PENDING',
  })
  status!: OrderStatus;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt!: Date;

  @ApiPropertyOptional({ example: '2024-01-02T00:00:00Z' })
  confirmedAt?: Date | null;

  @ApiPropertyOptional({ example: '2024-01-03T00:00:00Z' })
  completedAt?: Date | null;

  @ApiPropertyOptional({ example: '2024-01-03T00:00:00Z' })
  cancelledAt?: Date | null;

  @ApiPropertyOptional({ example: 'Giao hàng buổi sáng' })
  note?: string | null;
}

export class OrderWithRelationsDto extends OrderResponseDto {
  @ApiPropertyOptional({ type: () => OrderAccountDto, description: 'Thông tin buyer' })
  @Type(() => OrderAccountDto)
  buyer?: OrderAccountDto;

  @ApiPropertyOptional({ type: () => OrderAccountDto, description: 'Thông tin seller' })
  @Type(() => OrderAccountDto)
  seller?: OrderAccountDto;

  @ApiPropertyOptional({ type: () => OrderPostDto, description: 'Thông tin bài đăng' })
  @Type(() => OrderPostDto)
  post?: OrderPostDto;
}
