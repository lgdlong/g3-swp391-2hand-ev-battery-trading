// create-bike-details.dto.ts
import { IsEnum, IsInt, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BikeStyle, Origin, VehicleColor } from '../../../../shared/enums/vehicle.enum';

export class CreateBikeDetailsDto {
  @ApiPropertyOptional({
    description: 'ID hãng',
    format: 'int32',
    minimum: 0,
    nullable: true,
    example: 12,
  })
  @IsOptional()
  @IsInt()
  brand_id?: number;

  @ApiPropertyOptional({
    description: 'ID model',
    format: 'int32',
    minimum: 0,
    nullable: true,
    example: 345,
  })
  @IsOptional()
  @IsInt()
  model_id?: number;

  @ApiPropertyOptional({
    description: 'Năm sản xuất',
    format: 'int32',
    minimum: 1900,
    nullable: true,
    example: 2022,
  })
  @IsOptional()
  @IsInt()
  manufacture_year?: number;

  @ApiPropertyOptional({ description: 'Dáng xe', enum: BikeStyle, nullable: true })
  @IsOptional()
  @IsEnum(BikeStyle)
  bike_style?: BikeStyle;

  @ApiPropertyOptional({ description: 'Xuất xứ', enum: Origin, nullable: true })
  @IsOptional()
  @IsEnum(Origin)
  origin?: Origin;

  @ApiPropertyOptional({ description: 'Màu xe', enum: VehicleColor, nullable: true })
  @IsOptional()
  @IsEnum(VehicleColor)
  color?: VehicleColor;

  @ApiPropertyOptional({
    description: 'Biển số',
    maxLength: 20,
    nullable: true,
    example: '59A1-123.45',
  })
  @IsOptional()
  @MaxLength(20)
  license_plate?: string;

  @ApiPropertyOptional({
    description: 'Số đời chủ',
    format: 'int32',
    minimum: 0,
    nullable: true,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  owners_count?: number;

  @ApiPropertyOptional({
    description: 'Odo (km)',
    format: 'int32',
    minimum: 0,
    nullable: true,
    example: 8500,
  })
  @IsOptional()
  @IsInt()
  odo_km?: number;

  @ApiPropertyOptional({
    description: 'Dung lượng pin (kWh)',
    type: Number,
    format: 'float',
    minimum: 0,
    nullable: true,
    example: 2.5,
  })
  @IsOptional()
  battery_capacity_kwh?: number;

  @ApiPropertyOptional({
    description: 'Quãng đường tối đa (km)',
    format: 'int32',
    minimum: 0,
    nullable: true,
    example: 70,
  })
  @IsOptional()
  @IsInt()
  range_km?: number;

  @ApiPropertyOptional({
    description: 'Công suất motor (kW)',
    type: Number,
    format: 'float',
    minimum: 0,
    nullable: true,
    example: 3,
  })
  @IsOptional()
  motor_power_kw?: number;

  @ApiPropertyOptional({
    description: 'Sạc AC (kW)',
    type: Number,
    format: 'float',
    minimum: 0,
    nullable: true,
    example: 1.5,
  })
  @IsOptional()
  charge_ac_kw?: number;

  @ApiPropertyOptional({
    description: 'Tình trạng pin (%)',
    type: Number,
    format: 'float',
    minimum: 0,
    maximum: 100,
    nullable: true,
    example: 92,
  })
  @IsOptional()
  battery_health_pct?: number;
}
