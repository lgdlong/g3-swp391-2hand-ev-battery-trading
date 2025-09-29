import { Injectable } from '@nestjs/common';
import { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Injectable()
export class UploadService {
  constructor(private readonly cloudinary: CloudinaryService) {}

  async uploadImage(
    file: Express.Multer.File,
    opts: UploadApiOptions = {},
  ): Promise<UploadApiResponse> {
    return this.cloudinary.uploadBuffer(file.buffer, opts);
  }

  async deleteImage(publicId: string) {
    return this.cloudinary.delete(publicId);
  }
}
