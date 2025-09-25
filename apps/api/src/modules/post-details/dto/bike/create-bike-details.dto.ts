import { IsEnum, IsInt, IsOptional, MaxLength } from 'class-validator';
import { BikeStyle, Origin, VehicleColor } from '../../../../shared/enums/vehicle.enum';

export class CreateBikeDetailsDto {
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
  @IsEnum(BikeStyle)
  bike_style?: BikeStyle;

  @IsOptional()
  @IsEnum(Origin)
  origin?: Origin;

  @IsOptional()
  @IsEnum(VehicleColor)
  color?: VehicleColor;

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
  motor_power_kw?: number;

  @IsOptional()
  charge_ac_kw?: number;

  @IsOptional()
  battery_health_pct?: number;
}
