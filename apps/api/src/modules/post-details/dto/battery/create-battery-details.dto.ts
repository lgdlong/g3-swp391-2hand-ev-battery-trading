import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BatteryChemistry, OriginEnum } from '../../../../shared/enums/battery.enum';

export class CreateBatteryDetailsDto {
  @ApiPropertyOptional({
    description: 'ID hãng pin',
    format: 'int32',
    minimum: 1,
    nullable: true,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  brand_id?: number;

  @ApiPropertyOptional({
    description: 'Điện áp danh định (V)',
    format: 'float',
    minimum: 0,
    maximum: 1000,
    nullable: true,
    example: 48.0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1000)
  voltageV?: number;

  @ApiPropertyOptional({
    description: 'Dung lượng (Ah)',
    format: 'float',
    minimum: 0,
    maximum: 9999,
    nullable: true,
    example: 20.5,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999)
  capacityAh?: number;

  @ApiPropertyOptional({
    description: 'Thời gian sạc đầy (giờ)',
    format: 'float',
    minimum: 0,
    maximum: 24,
    nullable: true,
    example: 4.5,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(24)
  chargeTimeHours?: number;

  @ApiPropertyOptional({
    description: 'Loại hoá học cell',
    enum: BatteryChemistry,
    nullable: true,
    example: BatteryChemistry.LFP,
  })
  @IsOptional()
  @IsEnum(BatteryChemistry)
  chemistry?: BatteryChemistry;

  @ApiPropertyOptional({
    description: 'Xuất xứ',
    enum: OriginEnum,
    nullable: true,
    example: OriginEnum.NHAP_KHAU,
  })
  @IsOptional()
  @IsEnum(OriginEnum)
  origin?: OriginEnum;

  @ApiPropertyOptional({
    description: 'Trọng lượng khối pin (kg)',
    format: 'float',
    minimum: 0,
    maximum: 9999,
    nullable: true,
    example: 12.5,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999)
  weightKg?: number;

  @ApiPropertyOptional({
    description: 'Tuổi thọ chu kỳ sạc/xả (số chu kỳ)',
    format: 'int32',
    minimum: 0,
    maximum: 100000,
    nullable: true,
    example: 1000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  cycleLife?: number;

  @ApiPropertyOptional({
    description: 'Quãng đường ước tính cho 1 lần sạc (km)',
    format: 'int32',
    minimum: 0,
    maximum: 10000,
    nullable: true,
    example: 60,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  rangeKm?: number;

  @ApiPropertyOptional({
    description: 'Ghi chú tương thích (xe, BMS, cell, kích thước...)',
    nullable: true,
    example: 'Tương thích với xe VinFast Klara, Pega eSH',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  compatibleNotes?: string;
}
