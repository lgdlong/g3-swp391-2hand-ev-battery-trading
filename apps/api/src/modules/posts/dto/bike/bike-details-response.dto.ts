import { ApiProperty } from '@nestjs/swagger';
import { BikeStyle, Origin, VehicleColor } from '../../../../shared/enums/vehicle.enum';

export class BikeDetailsResponseDto {
  @ApiProperty({ nullable: true })
  brand_id!: number | null;

  @ApiProperty({ nullable: true })
  model_id!: number | null;

  @ApiProperty({ nullable: true })
  trim_id!: number | null;

  @ApiProperty({ nullable: true })
  manufacture_year!: number | null;

  @ApiProperty({ enum: BikeStyle, nullable: true })
  bike_style!: BikeStyle | null;

  @ApiProperty({ enum: Origin, nullable: true })
  origin!: Origin | null;

  @ApiProperty({ enum: VehicleColor, nullable: true })
  color_id!: VehicleColor | null;

  @ApiProperty({ nullable: true })
  license_plate!: string | null;

  @ApiProperty({ nullable: true })
  owners_count!: number | null;

  @ApiProperty({ nullable: true })
  odo_km!: number | null;

  @ApiProperty({ nullable: true })
  battery_capacity_kwh!: number | null;

  @ApiProperty({ nullable: true })
  range_km!: number | null;

  @ApiProperty({ nullable: true })
  motor_power_kw!: number | null;

  @ApiProperty({ nullable: true })
  charge_ac_kw!: number | null;

  @ApiProperty({ nullable: true })
  battery_health_pct!: number | null;
}
