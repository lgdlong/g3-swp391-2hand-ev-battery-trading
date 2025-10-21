import { IsNumber, IsString, IsUrl } from 'class-validator';

export class CreatePayoDto {
  @IsNumber()
  orderCode!: number;

  @IsNumber()
  amount!: number;

  @IsString()
  description!: string;

  @IsUrl()
  cancelUrl!: string;

  @IsUrl()
  returnUrl!: string;

  @IsString()
  buyerName?: string;
}
