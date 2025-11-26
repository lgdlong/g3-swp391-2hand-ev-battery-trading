import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum SellerAction {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
}

export class SellerConfirmDto {
  @ApiProperty({
    enum: SellerAction,
    example: SellerAction.ACCEPT,
    description: 'Hành động của seller: ACCEPT (chấp nhận) hoặc REJECT (từ chối)',
  })
  @IsEnum(SellerAction)
  action!: SellerAction;

  @ApiPropertyOptional({ example: 'Xe đã bán cho người khác', description: 'Lý do từ chối' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
