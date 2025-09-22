import { Module } from '@nestjs/common';
import { BikeCatalogService } from './bike-catalog.service';
import { BikeCatalogController } from './bike-catalog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BikeBrand } from './entities/bike-brand.entity';
import { BikeModel } from './entities/bike-model.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([BikeBrand, BikeModel]), AuthModule],
  controllers: [BikeCatalogController],
  providers: [BikeCatalogService],
})
export class BikeCatalogModule {}
