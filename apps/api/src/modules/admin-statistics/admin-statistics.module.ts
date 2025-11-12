import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminStatisticsController } from './admin-statistics.controller';
import { AdminStatisticsService } from './admin-statistics.service';
import { Wallet } from '../wallets/entities/wallet.entity';
import { WalletTransaction } from '../wallets/entities/wallet-transaction.entity';
import { PostPayment } from '../transactions/entities';
import { PostFraudFlag } from '../post-fraud-flags/entities/post-fraud-flag.entity';
import { ServiceType } from '../service-types/entities/service-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, WalletTransaction, PostPayment, PostFraudFlag, ServiceType]),
  ],
  controllers: [AdminStatisticsController],
  providers: [AdminStatisticsService],
  exports: [AdminStatisticsService],
})
export class AdminStatisticsModule {}
