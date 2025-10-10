import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatteryBrand } from './entities/battery-brand.entity';
import { BatteryCatalogService } from './battery-catalog.service';
import { BatteryCatalogController } from './battery-catalog.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BatteryBrand])],
  controllers: [BatteryCatalogController],
  providers: [BatteryCatalogService],
  exports: [BatteryCatalogService],
})
export class BatteryCatalogModule {}
