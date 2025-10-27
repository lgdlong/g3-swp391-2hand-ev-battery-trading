import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateFeeTierDto {
  @ApiProperty({
    description: 'Minimum price in VND',
    minimum: 0,
    example: 0,
  })
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  minPrice!: number;

  @ApiPropertyOptional({
    description: 'Maximum price in VND (null for unlimited)',
    minimum: 0,
    example: 10000000,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  maxPrice?: number | null;

  @ApiProperty({
    description: 'Deposit rate (0.0000 to 1.0000)',
    minimum: 0,
    maximum: 1,
    example: 0.1,
  })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  depositRate!: number;

  @ApiPropertyOptional({
    description: 'Whether this tier is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
