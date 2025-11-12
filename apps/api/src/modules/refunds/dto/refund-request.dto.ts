import {
  IsOptional, IsString, MaxLength, IsBoolean, IsEnum, IsInt, Min, ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RefundScenario } from '../../../shared/enums/refund-scenario.enum';

export class RefundRequestDto {
  // Ưu tiên orderCode vì dễ map PayOS
  @IsOptional()
  @IsString()
  orderCode?: string;

  // Hoặc dùng id trong DB mình
  @ValidateIf(o => !o.orderCode)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  paymentOrderId?: number;

  // Trường hợp đặc biệt: trỏ theo payable (post/auction/…)
  @IsOptional()
  @IsString()
  payableType?: string;      // 'POST' | 'AUCTION' | ...
  @ValidateIf(o => !!o.payableType)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  payableId?: number;

  @IsEnum(RefundScenario)
  scenario!: RefundScenario;

  // Nếu MANUAL có thể cho phép override rate (0..100)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  manualRatePercent?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;

  // Xem trước hay thực thi
  @Type(() => Boolean)
  @IsBoolean()
  dryRun: boolean = false;
}
