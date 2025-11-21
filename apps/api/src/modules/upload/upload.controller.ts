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
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('single')
  @ApiOperation({ summary: 'Upload 1 ảnh (field: file)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({
    description: 'Ảnh đã upload',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: 'https://res.cloudinary.com/.../image/upload/v123/abc.jpg',
        },
        publicId: { type: 'string', example: 'uploads/abc_xyz' },
        originalName: { type: 'string', example: 'car.jpg' },
        size: { type: 'number', example: 204800 },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'No file uploaded' })
  @UseInterceptors(SingleImageUploadInterceptor)
  async uploadSingleImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không có file nào được tải lên');
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
  @ApiOperation({ summary: 'Upload nhiều ảnh (field: files)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
      required: ['files'],
    },
  })
  @ApiOkResponse({
    description: 'Danh sách ảnh đã upload',
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                example: 'https://res.cloudinary.com/.../image/upload/v123/abc.jpg',
              },
              publicId: { type: 'string', example: 'uploads/abc_xyz' },
              originalName: { type: 'string', example: 'car.jpg' },
              size: { type: 'number', example: 204800 },
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'No files uploaded' })
  @UseInterceptors(MultipleImageUploadInterceptor(10))
  async uploadMultipleImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Không có file nào được tải lên');
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
  @ApiOperation({ summary: 'Xoá ảnh theo publicId' })
  @ApiParam({ name: 'imageId', example: 'uploads/abc_xyz' })
  @ApiOkResponse({
    description: 'Kết quả xoá ảnh',
    schema: {
      type: 'object',
      additionalProperties: true,
      example: { result: 'ok' },
    },
  })
  async removeImage(@Param('imageId') imageId: string) {
    const result = await this.uploadService.removeImage(imageId);
    return result;
  }
}
