import { forwardRef, Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), forwardRef(() => AuthModule), UploadModule],
  exports: [TypeOrmModule, AccountsService],
  controllers: [AccountsController],
  providers: [AccountsService, ConfigService],
})
export class AccountsModule {}
