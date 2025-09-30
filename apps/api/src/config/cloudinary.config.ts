import { ConfigService } from '@nestjs/config';

export const CLOUDINARY = 'CLOUDINARY';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (configService: ConfigService) => {
    // Dùng require để chắc chắn lấy đúng v2 trong mọi cấu hình module (CJS/ESM)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cloudinary = require('cloudinary').v2 as typeof import('cloudinary').v2;

    // 🧪 Debug nhẹ: bỏ nếu không cần
    // console.log('Cloudinary version:', cloudinary?.config?.name || 'no-config');
    cloudinary.config({
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
    });

    return cloudinary;
  },
  inject: [ConfigService],
};
