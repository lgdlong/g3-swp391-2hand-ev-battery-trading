import { Module } from '@nestjs/common';
import { PostBookmarksService } from './post_bookmarks.service';
import { PostBookmarksController } from './post_bookmarks.controller';
import { PostBookmark } from './entities/post_bookmark.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostBookmark])],
  controllers: [PostBookmarksController],
  providers: [PostBookmarksService],
  exports: [PostBookmarksService],
})
export class PostBookmarksModule {}
