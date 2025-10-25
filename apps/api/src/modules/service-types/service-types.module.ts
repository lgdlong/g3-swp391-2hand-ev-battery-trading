import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceTypesService } from './service-types.service';
import { ServiceTypesController } from './service-types.controller';
import { ServiceType } from './entities/service-type.entity';
import { ServiceTypeMapper } from './mappers/service-type.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceType])],
  controllers: [ServiceTypesController],
  providers: [ServiceTypesService, ServiceTypeMapper],
  exports: [TypeOrmModule, ServiceTypesService],
})
export class ServiceTypesModule {}
