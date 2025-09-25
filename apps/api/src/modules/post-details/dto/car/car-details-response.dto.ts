import { ApiProperty } from '@nestjs/swagger';
import { BodyStyle, Origin, VehicleColor } from '../../../../shared/enums/vehicle.enum';

export class CarDetailsResponseDto {
  @ApiProperty({ nullable: true })
  brand_id!: number | null;

  @ApiProperty({ nullable: true })
  model_id!: number | null;

  @ApiProperty({ nullable: true })
  manufacture_year!: number | null;

  @ApiProperty({ enum: BodyStyle, nullable: true })
  body_style!: BodyStyle | null;

  @ApiProperty({ enum: Origin, nullable: true })
  origin!: Origin | null;

  @ApiProperty({ enum: VehicleColor, nullable: true })
  color!: VehicleColor | null;

  @ApiProperty({ nullable: true })
  seats!: number | null;

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
  charge_ac_kw!: number | null;

  @ApiProperty({ nullable: true })
  charge_dc_kw!: number | null;

  @ApiProperty({ nullable: true })
  battery_health_pct!: number | null;
}
