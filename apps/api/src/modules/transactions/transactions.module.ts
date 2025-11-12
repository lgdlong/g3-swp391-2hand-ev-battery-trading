import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { RefundCalculationService } from './services/refund-calculation.service';
import { Contract, PostPayment } from './entities';
import { Post } from '../posts/entities/post.entity';
import { WalletsModule } from '../wallets/wallets.module';
import { SettingsModule } from '../settings/settings.module';
import { ChatModule } from '../chat/chat.module';
import { PostFraudFlagsModule } from '../post-fraud-flags/post-fraud-flags.module';
import { PostFraudFlag } from '../post-fraud-flags/entities/post-fraud-flag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract, PostPayment, PostFraudFlag, Post]),
    WalletsModule,
    SettingsModule,
    forwardRef(() => ChatModule), // Use forwardRef to avoid circular dependency
    PostFraudFlagsModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, RefundCalculationService],
  exports: [TypeOrmModule, TransactionsService, RefundCalculationService],
})
export class TransactionsModule {}
