import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeTier } from './entities/fee-tier.entity';
import { PostLifecycle } from './entities/post-lifecycle.entity';
import { FeeTierService } from './service/fee-tier.service';
import { PostLifecycleService } from './service/post-lifecycle.service';
import { FeeTierController } from './controller/fee-tier.controller';
import { PostLifecycleController } from './controller/post-lifecycle.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FeeTier, PostLifecycle])],
  controllers: [FeeTierController, PostLifecycleController],
  providers: [FeeTierService, PostLifecycleService],
  exports: [FeeTierService, PostLifecycleService],
})
export class SettingsModule {}
