import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { CloudinaryProvider } from 'src/config/cloudinary.config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { PostImage } from '../posts/entities/post-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostImage])],
  providers: [CloudinaryProvider, CloudinaryService, UploadService],
  exports: [CloudinaryProvider, CloudinaryService, UploadService],
  controllers: [UploadController],
})
export class UploadModule {}
