import { IsOptional, IsString } from 'class-validator';

export class CancelPaymentDto {
  @IsOptional()
  @IsString()
  reason?: string;
}