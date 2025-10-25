import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Min, IsOptional, IsString } from 'class-validator';

export class CreateTopupDto {
  @ApiProperty({
    description: 'Amount to top up in VND',
    example: 100000,
    minimum: 10000,
  })
  @IsNumber()
  @IsPositive()
  @Min(2000)
  amount!: number;

  @ApiProperty({
    description: 'Return URL after successful payment',
    example: 'https://yourdomain.com/topup/success',
    required: false,
  })
  @IsOptional()
  @IsString()
  returnUrl?: string;

  @ApiProperty({
    description: 'Cancel URL if payment is cancelled',
    example: 'https://yourdomain.com/topup/cancel',
    required: false,
  })
  @IsOptional()
  @IsString()
  cancelUrl?: string;
}
