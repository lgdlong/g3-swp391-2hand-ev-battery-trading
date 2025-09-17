import { Module } from '@nestjs/common';
import { VehicleColorsService } from './vehicle-colors.service';
import { VehicleColorsController } from './vehicle-colors.controller';

@Module({
  controllers: [VehicleColorsController],
  providers: [VehicleColorsService],
})
export class VehicleColorsModule {}
