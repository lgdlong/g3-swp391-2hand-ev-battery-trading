import { Module } from '@nestjs/common';
import { BikeService } from './bike.service';
import { BikeController } from './bike.controller';

@Module({
  controllers: [BikeController],
  providers: [BikeService],
})
export class BikeModule {}
