import { Module } from '@nestjs/common';
import { PostEvCarDetails } from './entities/post-ev-car-details.entity';
import { PostEvBikeDetails } from './entities/post-ev-bike-details.entity';
import { PostBatteryDetails } from './entities/post-battery-details.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarDetailsService } from './services/car-details.service';
import { BatteryDetailsService } from './services/battery-details.service';
import { BikeDetailsService } from './services/bike-details.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostEvCarDetails, PostEvBikeDetails, PostBatteryDetails])],
  providers: [CarDetailsService, BikeDetailsService, BatteryDetailsService],
  exports: [TypeOrmModule, CarDetailsService, BikeDetailsService, BatteryDetailsService],
})
export class PostDetailsModule {}
