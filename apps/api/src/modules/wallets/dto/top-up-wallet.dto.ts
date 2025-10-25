import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class TopUpWalletDto {
  @ApiProperty({
    description: 'Amount to top up in VND',
    example: 100000,
    minimum: 1000,
  })
  @IsNumber()
  @Min(1000, { message: 'Minimum top-up amount is 1,000 VND' })
  amount!: number;

  @ApiProperty({
    description: 'Description for the top-up transaction',
    example: 'Nạp tiền vào ví từ PayOS',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Payment order ID reference',
    example: '123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentOrderId?: string;
}
