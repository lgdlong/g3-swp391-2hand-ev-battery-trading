import {
  BadRequestException,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import {
  SingleImageUploadInterceptor,
  MultipleImageUploadInterceptor,
} from '../../core/interceptors/image-upload.interceptor';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('single')
  @UseInterceptors(SingleImageUploadInterceptor)
  async uploadSingleImage(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const cloudinaryResult = await this.uploadService.uploadImage(file, {
      folder: 'uploads',
    });

    return {
      url: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      originalName: file.originalname,
      size: file.size,
    };
  }

  @Post('multiple')
  @UseInterceptors(MultipleImageUploadInterceptor(10))
  async uploadMultipleImages(
    @UploadedFiles()
    files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const uploaded = await Promise.all(
      files.map(async (file) => {
        const cloudinaryResult = await this.uploadService.uploadImage(file, {
          folder: 'uploads',
        });
        return {
          url: cloudinaryResult.secure_url,
          publicId: cloudinaryResult.public_id,
          originalName: file.originalname,
          size: file.size,
        };
      }),
    );

    return { images: uploaded };
  }

  @Delete('image/:imageId')
  async removeImage(@Param('imageId') imageId: string) {
    const result = await this.uploadService.removeImage(imageId);
    return result;
  }
}
