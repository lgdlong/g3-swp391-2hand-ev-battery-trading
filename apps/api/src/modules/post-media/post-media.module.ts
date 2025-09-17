import { Module } from '@nestjs/common';
import { PostMediaService } from './post-media.service';
import { PostMediaController } from './post-media.controller';

@Module({
  controllers: [PostMediaController],
  providers: [PostMediaService],
})
export class PostMediaModule {}
