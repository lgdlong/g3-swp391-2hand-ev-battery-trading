// create-car-details.dto.ts
import { IsEnum, IsIn, IsInt, IsOptional, MaxLength, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BodyStyle, Origin, VehicleColor } from '../../../../shared/enums/vehicle.enum';
import { SEAT_OPTIONS, type SeatOption } from '../../../../shared/constants';

export class CreateCarDetailsDto {
  @ApiPropertyOptional({
    description: 'ID hãng',
    format: 'int32',
    minimum: 0,
    nullable: true,
    example: 5,
  })
  @IsOptional()
  @IsInt()
  brand_id?: number;

  @ApiPropertyOptional({
    description: 'ID model',
    format: 'int32',
    minimum: 0,
    nullable: true,
    example: 101,
  })
  @IsOptional()
  @IsInt()
  model_id?: number;

  @ApiPropertyOptional({
    description: 'Năm sản xuất',
    format: 'int32',
    minimum: 1900,
    nullable: true,
    example: 2021,
  })
  @IsOptional()
  @IsInt()
  manufacture_year?: number;

  @ApiPropertyOptional({ description: 'Dáng xe', enum: BodyStyle, nullable: true })
  @IsOptional()
  @IsEnum(BodyStyle)
  body_style?: BodyStyle;

  @ApiPropertyOptional({ description: 'Xuất xứ', enum: Origin, nullable: true })
  @IsOptional()
  @IsEnum(Origin)
  origin?: Origin;

  @ApiPropertyOptional({ description: 'Màu xe', enum: VehicleColor, nullable: true })
  @IsOptional()
  @IsEnum(VehicleColor)
  color?: VehicleColor;

  @ApiPropertyOptional({
    description: 'Số ghế (chỉ chấp nhận các giá trị trong SEAT_OPTIONS)',
    enum: SEAT_OPTIONS as unknown as number[],
    nullable: true,
    example: 5,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined ? null : Number(value),
  )
  @IsInt()
  @IsIn(SEAT_OPTIONS as unknown as number[])
  seats?: SeatOption;

  @ApiPropertyOptional({
    description: 'Biển số',
    maxLength: 20,
    nullable: true,
    example: '30G-678.90',
  })
  @IsOptional()
  @MaxLength(20)
  license_plate?: string;

  @ApiPropertyOptional({
    description: 'Số đời chủ',
    format: 'int32',
    minimum: 0,
    nullable: true,
    example: 2,
  })
  @IsOptional()
  @IsInt()
  owners_count?: number;

  @ApiPropertyOptional({
    description: 'Odo (km)',
    format: 'int32',
    minimum: 0,
    nullable: true,
    example: 42000,
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
    example: 75,
  })
  @IsOptional()
  battery_capacity_kwh?: number;

  @ApiPropertyOptional({
    description: 'Quãng đường tối đa (km)',
    format: 'int32',
    minimum: 0,
    nullable: true,
    example: 450,
  })
  @IsOptional()
  @IsInt()
  range_km?: number;

  @ApiPropertyOptional({
    description: 'Sạc AC (kW)',
    type: Number,
    format: 'float',
    minimum: 0,
    nullable: true,
    example: 11,
  })
  @IsOptional()
  charge_ac_kw?: number;

  @ApiPropertyOptional({
    description: 'Sạc DC (kW)',
    type: Number,
    format: 'float',
    minimum: 0,
    nullable: true,
    example: 120,
  })
  @IsOptional()
  charge_dc_kw?: number;

  @ApiPropertyOptional({
    description: 'Tình trạng pin (%)',
    type: Number,
    format: 'float',
    minimum: 0,
    maximum: 100,
    nullable: true,
    example: 90,
  })
  @IsOptional()
  battery_health_pct?: number;

  @ApiPropertyOptional({
    description: 'Xe có kèm pin hay không',
    type: Boolean,
    default: false,
    example: true,
  })
  @IsOptional()
  has_bundled_battery?: boolean;

  @ApiPropertyOptional({
    description: 'Pin là pin gốc hãng không',
    type: Boolean,
    default: false,
    example: true,
  })
  @IsOptional()
  is_original_battery?: boolean;
}
