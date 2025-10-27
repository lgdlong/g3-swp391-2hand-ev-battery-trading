import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CancelPaymentDto {
  @ApiPropertyOptional({
    description: 'Reason for cancelling the payment',
    example: 'Customer requested cancellation',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
