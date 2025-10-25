import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class DeductWalletDto {
  @ApiProperty({
    description: 'Amount to deduct in VND',
    example: 50000,
    minimum: 1000,
  })
  @IsNumber()
  @Min(1000, { message: 'Minimum deduction amount is 1,000 VND' })
  amount!: number;

  @ApiProperty({
    description: 'Description for the deduction transaction',
    example: 'Trừ tiền phí dịch vụ',
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