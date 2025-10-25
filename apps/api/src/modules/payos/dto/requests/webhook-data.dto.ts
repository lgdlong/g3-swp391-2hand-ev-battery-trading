import { IsString, IsNumber, IsOptional, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WebhookPayosDataDto {
  @ApiProperty({ example: '22800957' })
  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @ApiProperty({ example: 2000 })
  @IsNumber()
  amount!: number;

  @ApiProperty({ example: 'CSD3CENUSV4' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '3596' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({ example: '2025-10-22 10:26:44' })
  @IsString()
  @IsOptional()
  transactionDateTime?: string;

  @ApiProperty({ example: 'LOCCASS000334316' })
  @IsString()
  @IsOptional()
  virtualAccountNumber?: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  counterAccountBankId?: string;

  @ApiProperty({ example: 'TMCP Ngoai Thuong Viet Nam' })
  @IsOptional()
  @IsString()
  counterAccountBankName?: string;

  @ApiProperty({ example: 'PHUNG LUU HOANG LONG198 Tran Quang Khai, Ha Noi' })
  @IsOptional()
  @IsString()
  counterAccountName?: string;

  @ApiProperty({ example: '1038182261' })
  @IsOptional()
  @IsString()
  counterAccountNumber?: string;

  @ApiProperty({ example: 'DUONG QUOC THAI' })
  @IsOptional()
  @IsString()
  virtualAccountName?: string;

  @ApiProperty({ example: 'VND' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 9 })
  @IsNumber()
  orderCode!: number;

  @ApiProperty({ example: 'e57cd3980683400390ca2bb1555f2427' })
  @IsString()
  @IsOptional()
  paymentLinkId?: string;

  @ApiProperty({ example: '00' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'success' })
  @IsString()
  @IsOptional()
  desc?: string;
}
