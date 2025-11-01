import { Module } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { RefundsController } from './refunds.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { PaymentOrder } from '../payos/entities';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentOrder]), WalletsModule],
  controllers: [RefundsController],
  providers: [RefundsService],
})
export class RefundsModule {}
