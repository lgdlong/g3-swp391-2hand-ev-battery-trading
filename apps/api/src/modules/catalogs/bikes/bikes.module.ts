import { Module } from '@nestjs/common';
import { BikesService } from './bikes.service';
import { BikesController } from './bikes.controller';

@Module({
  controllers: [BikesController],
  providers: [BikesService],
})
export class BikesModule {}
