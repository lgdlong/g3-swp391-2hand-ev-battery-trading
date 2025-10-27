import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { PostImage } from '../posts/entities/post-image.entity';

@Injectable()
export class UploadService {
  constructor(
    private readonly cloudinary: CloudinaryService,
    @InjectRepository(PostImage)
    private readonly imagesRepo: Repository<PostImage>,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
    opts: UploadApiOptions = {},
  ): Promise<UploadApiResponse> {
    return this.cloudinary.uploadBuffer(file.buffer, opts);
  }

  async deleteImage(publicId: string) {
    return this.cloudinary.delete(publicId);
  }

  async removeImage(imageId: string) {
    const img = await this.imagesRepo.findOne({ where: { id: imageId } });
    if (!img) throw new NotFoundException('Image not found');

    await this.cloudinary.delete(img.public_id).catch(() => null);
    await this.imagesRepo.delete({ id: imageId });
    return { ok: true };
  }
}
