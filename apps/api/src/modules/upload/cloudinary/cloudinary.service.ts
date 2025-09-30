import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { v2 as Cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { CLOUDINARY } from 'src/config/cloudinary.config';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(CLOUDINARY) private c: typeof Cloudinary,
    private readonly configService: ConfigService,
  ) {}

  uploadBuffer(buffer: Buffer, opts: UploadApiOptions = {}) {
    const upload_preset = this.configService.get<string>('CLOUDINARY_UPLOAD_PRESET')!;

    // If folder is specified in opts, completely bypass upload_preset
    const uploadOptions: UploadApiOptions = opts.folder
      ? {
          resource_type: 'image' as const,
          folder: opts.folder,
          // Add any other options you might need when not using preset
          quality: 'auto',
          fetch_format: 'auto',
          ...opts,
        }
      : ({ upload_preset, resource_type: 'image' as const, ...opts } as UploadApiOptions);

    return new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = this.c.uploader.upload_stream(uploadOptions, (err, res) => {
        if (err) {
          reject(new Error(err.message || 'Upload failed'));
        } else {
          resolve(res!);
        }
      });
      stream.end(buffer);
    });
  }

  delete(publicId: string) {
    return this.c.uploader.destroy(publicId, { resource_type: 'image' });
  }
}
