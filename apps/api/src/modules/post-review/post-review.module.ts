import { Module } from '@nestjs/common';
import { PostReviewService } from './post-review.service';
import { PostReviewController } from './post-review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostReviewLog } from './entities/post-review-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostReviewLog])],
  controllers: [PostReviewController],
  providers: [PostReviewService],
  exports: [PostReviewService],
})
export class PostReviewModule {}
