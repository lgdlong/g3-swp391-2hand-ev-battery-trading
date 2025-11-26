import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../../shared/enums/order-status.enum';

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

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
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
  @ApiPropertyOptional({ description: 'Thông tin buyer' })
  buyer?: {
    id: number;
    fullName: string;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
  };

  @ApiPropertyOptional({ description: 'Thông tin seller' })
  seller?: {
    id: number;
    fullName: string;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
  };

  @ApiPropertyOptional({ description: 'Thông tin bài đăng' })
  post?: {
    id: string;
    title: string;
    priceVnd: string;
    postType: string;
    images: Array<{
      id: string;
      url: string;
      position: number;
    }>;
  };
}
