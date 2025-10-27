import { ApiProperty } from '@nestjs/swagger';

export class WalletResponseDto {
  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ example: '100000.00' })
  balance!: string;

  @ApiProperty({ example: '2025-10-23T10:00:00Z' })
  updatedAt!: Date;
}
