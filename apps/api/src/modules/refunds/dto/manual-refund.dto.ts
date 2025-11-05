import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { RefundScenario } from '../../../shared/enums/refund-scenario.enum';

export class ManualRefundDto {
  @ApiProperty({
    description: 'ID của post cần refund deposit',
    example: '123',
  })
  @IsString()
  postId!: string;

  @ApiPropertyOptional({
    description: 'Refund scenario (nếu không truyền thì tự tính từ reviewedAt)',
    enum: RefundScenario,
    example: RefundScenario.EXPIRED,
  })
  @IsOptional()
  @IsEnum(RefundScenario)
  scenario?: RefundScenario;

  @ApiPropertyOptional({
    description: 'Custom refund rate % (override policy) - 0-100',
    example: 80,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  customRate?: number;

  @ApiProperty({
    description: 'Lý do admin refund manual',
    example: 'User request special case',
  })
  @IsString()
  reason!: string;

  @ApiPropertyOptional({
    description: 'Dry run - chỉ xem preview, không thực hiện',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}
