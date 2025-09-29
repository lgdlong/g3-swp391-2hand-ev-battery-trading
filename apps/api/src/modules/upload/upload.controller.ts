import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { PostsService } from '../posts/posts.service';
import { MultipleImageUploadInterceptor } from '../../core/interceptors/image-upload.interceptor';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly postsService: PostsService,
  ) {}

  @Post('post/:postId/images')
  @UseInterceptors(MultipleImageUploadInterceptor(10))
  async uploadPostImages(
    @Param('postId') postId: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (!postId || isNaN(+postId)) {
      throw new BadRequestException('Invalid postId');
    }

    // 1) Upload to Cloudinary (or your provider)
    const uploaded = await Promise.all(
      files.map(async (file) => {
        const res = await this.uploadService.uploadImage(file, {
          folder: `posts/${postId}`,
        });
        return {
          public_id: res.public_id,
          url: res.secure_url,
          width: res.width,
          height: res.height,
          bytes: res.bytes,
          format: res.format ?? null,
        };
      }),
    );

    // 2) Persist to DB (atomic)
    const saved = await this.postsService.addImages(postId, uploaded);

    // 3) Return DB records (include ids/positions)
    return { images: saved };
  }

  @Get('post/:postId/images')
  async getPostImages(@Param('postId') postId: string) {
    const images = await this.postsService.listImages(postId);
    return { images };
  }

  @Delete('post/image/:imageId')
  async removePostImage(@Param('imageId') imageId: string) {
    const result = await this.postsService.removeImage(imageId);
    return result;
  }
}
