import { IsNumber, IsString, IsUrl, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePayosDto {
  @ApiProperty({
    description: 'Unique order code for the payment',
    example: 123456789,
    type: 'number',
  })
  @IsNumber()
  orderCode!: number;

  @ApiProperty({
    description: 'Payment amount in Vietnamese Dong (VND)',
    example: 50000,
    minimum: 1000,
    type: 'number',
  })
  @IsNumber()
  amount!: number;

  @ApiProperty({
    description: 'Description of the payment/order',
    example: 'Payment for EV Battery - Model ABC123',
    maxLength: 255,
  })
  @IsString()
  description!: string;

  @ApiProperty({
    description: 'URL to redirect when payment is cancelled',
    example: 'https://yourapp.com/payment/cancel',
    format: 'url',
  })
  @IsUrl()
  cancelUrl!: string;

  @ApiProperty({
    description: 'URL to redirect when payment is successful',
    example: 'https://yourapp.com/payment/success',
    format: 'url',
  })
  @IsUrl()
  returnUrl!: string;

  @ApiPropertyOptional({
    description: 'Name of the buyer (optional)',
    example: 'John Doe',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  buyerName?: string;
}
