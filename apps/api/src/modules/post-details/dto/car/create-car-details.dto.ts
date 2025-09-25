import { IsEnum, IsIn, IsInt, IsOptional, MaxLength } from 'class-validator';
import { BodyStyle, Origin, VehicleColor } from '../../../../shared/enums/vehicle.enum';
import { Transform } from 'class-transformer';
import { SEAT_OPTIONS } from '../../../../shared/constants';

export class CreateCarDetailsDto {
  @IsOptional()
  @IsInt()
  brand_id?: number;

  @IsOptional()
  @IsInt()
  model_id?: number;

  @IsOptional()
  @IsInt()
  manufacture_year?: number;

  @IsOptional()
  @IsEnum(BodyStyle)
  body_style?: BodyStyle;

  @IsOptional()
  @IsEnum(Origin)
  origin?: Origin;

  @IsOptional()
  @IsEnum(VehicleColor)
  color?: VehicleColor;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined ? null : Number(value),
  )
  @IsInt()
  @IsIn(SEAT_OPTIONS as unknown as number[])
  seats?: number;

  @IsOptional()
  @MaxLength(20)
  license_plate?: string;

  @IsOptional()
  @IsInt()
  owners_count?: number;

  @IsOptional()
  @IsInt()
  odo_km?: number;

  @IsOptional()
  battery_capacity_kwh?: number;

  @IsOptional()
  @IsInt()
  range_km?: number;

  @IsOptional()
  charge_ac_kw?: number;

  @IsOptional()
  charge_dc_kw?: number;

  @IsOptional()
  battery_health_pct?: number;
}
