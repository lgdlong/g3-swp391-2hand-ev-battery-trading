import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}

export class CreateModelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  // Dành cho endpoint POST /bike-catalog/models (không nested)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  brandId?: number;
}

export class CreateTrimDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  // Dành cho endpoint POST /bike-catalog/trims (không nested)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  modelId?: number;
}
