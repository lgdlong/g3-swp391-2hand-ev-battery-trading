import { forwardRef, Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { CloudinaryProvider } from 'src/config/cloudinary.config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [forwardRef(() => PostsModule)],
  providers: [CloudinaryProvider, CloudinaryService, UploadService],
  exports: [CloudinaryProvider, CloudinaryService, UploadService],
  controllers: [UploadController],
})
export class UploadModule {}
