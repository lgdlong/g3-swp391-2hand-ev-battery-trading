import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerifyPostController } from './verify-post.controller';
import { VerifyPostService } from './verify-post.service';
import { PostVerificationRequest } from './entities/post-verification-request.entity';
import { Post } from '../posts/entities/post.entity';
import { Account } from '../accounts/entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostVerificationRequest,
      Post,
      Account,
    ]),
  ],
  controllers: [VerifyPostController],
  providers: [VerifyPostService],
  exports: [VerifyPostService],
})
export class VerifyPostModule {}
