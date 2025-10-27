import { ApiProperty } from '@nestjs/swagger';

export class ServiceTypeResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'WALLET_TOPUP' })
  code!: string;

  @ApiProperty({ example: 'Nạp tiền vào ví' })
  name!: string;

  @ApiProperty({ example: 'Top up wallet balance', required: false })
  description?: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2025-10-23T10:00:00Z' })
  createdAt!: Date;
}
