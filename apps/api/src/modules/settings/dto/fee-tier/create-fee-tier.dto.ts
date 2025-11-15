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
    description: 'Posting fee amount in VND (fixed amount, not percentage)',
    minimum: 0,
    example: 20000,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  postingFee!: number;

  @ApiPropertyOptional({
    description: 'Whether this tier is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
