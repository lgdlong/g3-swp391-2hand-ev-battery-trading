import { Module } from '@nestjs/common';
import { PostReviewService } from './post-review.service';
import { PostReviewController } from './post-review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostReviewLog } from './entities/post-review-log.entity';
import { Post } from '../posts/entities/post.entity';
import { PostReviewLogMapper } from './mappers/post-review-log.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([PostReviewLog, Post])],
  controllers: [PostReviewController],
  providers: [PostReviewService, PostReviewLogMapper],
  exports: [PostReviewService],
})
export class PostReviewModule {}
