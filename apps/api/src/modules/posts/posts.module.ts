import { forwardRef, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { AuthModule } from '../auth/auth.module';
import { PostReviewLog } from './entities/post-review-log.entity';
import { PostMedia } from './entities/post-media.entity';
import { PostDetailsModule } from '../post-details/post-details.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostMedia, PostReviewLog]),
    AuthModule,
    // nếu sợ vòng phụ thuộc, có thể forwardRef — không bắt buộc ở đây
    forwardRef(() => PostDetailsModule),
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
