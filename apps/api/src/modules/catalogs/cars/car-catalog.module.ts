import { Module } from '@nestjs/common';
import { CarCatalogService } from './car-catalog.service';
import { CarCatalogController } from './car-catalog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarBrand } from './entities/car-brand.entity';
import { CarModel } from './entities/car-model.entity';
import { CarTrim } from './entities/car-trim.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarBrand, CarModel, CarTrim])],
  controllers: [CarCatalogController],
  providers: [CarCatalogService],
})
export class CarCatalogModule {}
