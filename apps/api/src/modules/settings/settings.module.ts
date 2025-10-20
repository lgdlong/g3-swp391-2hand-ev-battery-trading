import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeTier } from './entities/fee-tier.entity';
import { RefundPolicy } from './entities/refund-policy.entity';
import { PostLifecycle } from './entities/post-lifecycle.entity';
import { FeeTierService } from './service/fee-tier.service';
import { RefundPolicyService } from './service/refund-policy.service';
import { PostLifecycleService } from './service/post-lifecycle.service';
import { FeeTierController } from './controller/fee-tier.controller';
import { RefundPolicyController } from './controller/refund-policy.controller';
import { PostLifecycleController } from './controller/post-lifecycle.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FeeTier, RefundPolicy, PostLifecycle])],
  controllers: [FeeTierController, RefundPolicyController, PostLifecycleController],
  providers: [FeeTierService, RefundPolicyService, PostLifecycleService],
  exports: [FeeTierService, RefundPolicyService, PostLifecycleService],
})
export class SettingsModule {}
