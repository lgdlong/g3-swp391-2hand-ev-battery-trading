import { Module } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { RefundsController } from './refunds.controller';
import { RefundsCronService } from './refunds-cron.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { PaymentOrder } from '../payos/entities';
import { Refund } from './entities/refund.entity';
import { RefundPolicy } from '../settings/entities/refund-policy.entity';
import { Post } from '../posts/entities/post.entity';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Refund, PaymentOrder, RefundPolicy, Post]),
    WalletsModule,
  ],
  controllers: [RefundsController],
  providers: [RefundsService, RefundsCronService],
  exports: [RefundsService], // Export để có thể inject vào PostsService nếu cần
})
export class RefundsModule {}
