import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayosService } from './payos.service';
import { PayosController } from './payos.controller';
import { PaymentOrder, PayosWebhookLog } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentOrder, PayosWebhookLog])],
  controllers: [PayosController],
  providers: [PayosService],
  exports: [TypeOrmModule],
})
export class PayosModule {}
