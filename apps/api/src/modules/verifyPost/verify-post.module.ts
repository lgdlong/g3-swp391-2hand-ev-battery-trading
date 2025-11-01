import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerifyPostController } from './verify-post.controller';
import { VerifyPostService } from './verify-post.service';
import { PostVerificationRequest } from './entities/post-verification-request.entity';
import { Post } from '../posts/entities/post.entity';
import { Account } from '../accounts/entities/account.entity';
import { WalletsModule } from '../wallets/wallets.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostVerificationRequest, Post, Account]),
    forwardRef(() => WalletsModule),
    SettingsModule,
  ],
  controllers: [VerifyPostController],
  providers: [VerifyPostService],
  exports: [VerifyPostService],
})
export class VerifyPostModule {}
