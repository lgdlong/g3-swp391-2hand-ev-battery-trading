import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { RefundScenario } from '../../../shared/enums/refund-scenario.enum';

export class ManualRefundDto {
  @ApiProperty({
    description: 'Post ID that needs deposit refund',
    example: '123',
  })
  @IsString()
  postId!: string;

  @ApiPropertyOptional({
    description: 'Refund scenario (auto-calculated from reviewedAt if not provided)',
    enum: RefundScenario,
    example: RefundScenario.EXPIRED,
  })
  @IsOptional()
  @IsEnum(RefundScenario)
  scenario?: RefundScenario;

  @ApiPropertyOptional({
    description: 'Custom refund rate % (overrides policy) - Range: 0-100',
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
    description: 'Admin reason for manual refund',
    example: 'User request special case',
  })
  @IsString()
  reason!: string;

  @ApiPropertyOptional({
    description: 'Dry run mode - preview only, no actual execution',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}
