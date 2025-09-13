import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  exports: [TypeOrmModule, AccountsService],
  controllers: [AccountsController],
  providers: [AccountsService, ConfigService],
})
export class AccountsModule {}
