import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayosService } from './payos.service';
import { PayosController } from './payos.controller';
import { PaymentOrder, PayosWebhookLog } from './entities';
import { ServiceTypesModule } from '../service-types/service-types.module';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentOrder, PayosWebhookLog]),
    ServiceTypesModule,
    forwardRef(() => WalletsModule),
  ],
  controllers: [PayosController],
  providers: [PayosService],
  exports: [TypeOrmModule, PayosService],
})
export class PayosModule {}
