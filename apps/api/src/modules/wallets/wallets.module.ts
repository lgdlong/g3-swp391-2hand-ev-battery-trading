import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { Wallet, WalletTransaction } from './entities';
import { PayosModule } from '../payos/payos.module';
import { ServiceTypesModule } from '../service-types/service-types.module';
import { PaymentOrder } from '../payos/entities/payment-order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, WalletTransaction, PaymentOrder]),
    forwardRef(() => PayosModule),
    ServiceTypesModule,
  ],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [TypeOrmModule, WalletsService],
})
export class WalletsModule {}
