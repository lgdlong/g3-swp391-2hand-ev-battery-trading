import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { WalletTransactionType } from '../../../shared/enums/wallet-transaction-type.enum';

export class DeductWalletDto {
  @ApiProperty({
    description: 'Amount to deduct in VND',
    example: 50000,
    minimum: 1000,
  })
  @IsNumber()
  @Min(1000, { message: 'Minimum deduction amount is 1,000 VND' })
  amount!: number;

  @ApiPropertyOptional({
    description: 'Service type code for the transaction',
    example: 'POST_PAYMENT',
    enum: WalletTransactionType,
  })
  @IsOptional()
  @IsEnum(WalletTransactionType, {
    message: 'Service type must be a valid WalletTransactionType',
  })
  serviceTypeCode?: string;

  @ApiPropertyOptional({
    description: 'Description for the deduction transaction',
    example: 'Phí đặt cọc đăng bài',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Related entity type (e.g., payment_orders, posts)',
    example: 'payment_orders',
  })
  @IsOptional()
  @IsString()
  relatedEntityType?: string;

  @ApiPropertyOptional({
    description: 'Related entity ID reference',
    example: 'abc-123-def-456',
  })
  @IsOptional()
  @IsString()
  relatedEntityId?: string;

  @ApiPropertyOptional({
    description: 'Payment order ID reference (deprecated - use relatedEntityId instead)',
    example: '123456789',
  })
  @IsOptional()
  @IsString()
  paymentOrderId?: string;
}
