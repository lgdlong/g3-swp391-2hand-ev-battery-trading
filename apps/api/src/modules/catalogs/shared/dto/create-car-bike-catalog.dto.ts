import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({
    example: 'Toyota',
    description: 'Tên hãng xe (tối đa 100 ký tự)',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}

export class CreateModelDto {
  @ApiProperty({
    example: 'Corolla',
    description: 'Tên model (tối đa 120 ký tự)',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID của Brand (chỉ dùng cho endpoint POST /car-catalog/models)',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  brandId?: number;
}

export class CreateTrimDto {
  @ApiProperty({
    example: '2.0 AT Premium',
    description: 'Tên trim (tối đa 120 ký tự)',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    example: 10,
    description: 'ID của Model (chỉ dùng cho endpoint POST /car-catalog/trims)',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  modelId?: number;
}
