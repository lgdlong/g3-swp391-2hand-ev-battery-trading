import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateRefundPolicyDto {
  @ApiPropertyOptional({
    description: 'Refund rate for early cancellation (0.0000 to 1.0000)',
    minimum: 0,
    maximum: 1,
    example: 1.0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  cancelEarlyRate?: number | null;

  @ApiPropertyOptional({
    description: 'Refund rate when expired (0.0000 to 1.0000)',
    minimum: 0,
    maximum: 1,
    example: 0.8,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  expiredRate?: number | null;

  @ApiPropertyOptional({
    description: 'Refund rate when fraud suspected (0.0000 to 1.0000)',
    minimum: 0,
    maximum: 1,
    example: 0.3,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  fraudSuspectedRate?: number | null;

  @ApiPropertyOptional({
    description: 'Number of days to hold money when suspicious',
    minimum: 0,
    example: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  holdDays?: number | null;

  @ApiPropertyOptional({
    description: 'Auto refund after X days (0 = disabled)',
    minimum: 0,
    example: 7,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  autoRefundAfterDays?: number | null;
}
