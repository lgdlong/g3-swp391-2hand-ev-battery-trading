import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Contract, PostPayment } from './entities';
import { Post } from '../posts/entities/post.entity';
import { WalletsModule } from '../wallets/wallets.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract, PostPayment, Post]),
    WalletsModule,
    SettingsModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TypeOrmModule, TransactionsService],
})
export class TransactionsModule {}
