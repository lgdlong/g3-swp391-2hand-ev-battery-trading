import { ApiProperty } from '@nestjs/swagger';
import { ServiceTypeResponseDto } from '../../service-types/dto/service-type-response.dto';

export class WalletTransactionResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  walletUserId!: number;

  @ApiProperty({ example: '100000.00' })
  amount!: string;

  @ApiProperty({ example: 1 })
  serviceTypeId!: number;

  @ApiProperty({ type: ServiceTypeResponseDto })
  serviceType!: ServiceTypeResponseDto;

  @ApiProperty({ example: 'Nạp tiền vào ví', required: false })
  description?: string | null;

  @ApiProperty({ example: 'payment_orders', required: false })
  relatedEntityType?: string | null;

  @ApiProperty({ example: '123456789', required: false })
  relatedEntityId?: string | null;

  @ApiProperty({ example: '2025-10-23T10:00:00Z' })
  createdAt!: Date;
}
