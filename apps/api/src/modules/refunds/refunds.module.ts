import { Module } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { RefundsController } from './refunds.controller';
import { RefundsCronService } from './refunds-cron.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { PaymentOrder } from '../payos/entities';
import { Refund } from './entities/refund.entity';
import { Post } from '../posts/entities/post.entity';
import { PostPayment } from '../transactions/entities/post-payment.entity';
import { WalletsModule } from '../wallets/wallets.module';
import { SettingsModule } from '../settings/settings.module';
import { PostFraudFlagsModule } from '../post-fraud-flags/post-fraud-flags.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Refund, PaymentOrder, Post, PostPayment]),
    WalletsModule,
    SettingsModule,
    PostFraudFlagsModule,
    ChatModule,
  ],
  controllers: [RefundsController],
  providers: [RefundsService, RefundsCronService],
  exports: [RefundsService],
})
export class RefundsModule {}
