import { Module } from '@nestjs/common';
import { PostRatingService } from './post-ratings.service';
import { PostRatingController } from './post-ratings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostRatings } from './entities/post-ratings.entity';
import { Account } from '../accounts/entities/account.entity';
import { Post } from '../posts/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostRatings, Post, Account])],
  controllers: [PostRatingController],
  providers: [PostRatingService],
  exports: [PostRatingService],
})
export class PostRatingModule {}
