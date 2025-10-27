import { ApiProperty } from '@nestjs/swagger';
import { BatteryChemistry } from '../../../../shared/enums/battery.enum';
import { Origin } from 'src/shared/enums/vehicle.enum';

export class BatteryDetailResponseDto {
  @ApiProperty({ nullable: true })
  brandId!: number | null;

  @ApiProperty({ nullable: true })
  voltageV!: number | null;

  @ApiProperty({ nullable: true })
  capacityAh!: number | null;

  @ApiProperty({ nullable: true })
  chargeTimeHours!: number | null;

  @ApiProperty({ enum: BatteryChemistry, nullable: true })
  chemistry!: BatteryChemistry | null;

  @ApiProperty({ enum: Origin, nullable: true })
  origin!: Origin | null;
  @ApiProperty({ nullable: true })
  weightKg!: number | null;

  @ApiProperty({ nullable: true })
  cycleLife!: number | null;

  @ApiProperty({ nullable: true })
  rangeKm!: number | null;

  @ApiProperty({ nullable: true })
  compatibleNotes!: string | null;
}
