import { Module } from '@nestjs/common';
import { PostReviewService } from './post-review.service';
import { PostReviewController } from './post-review.controller';

@Module({
  controllers: [PostReviewController],
  providers: [PostReviewService],
})
export class PostReviewModule {}
