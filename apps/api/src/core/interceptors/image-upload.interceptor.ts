import { BadRequestException } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

/**
 * Cấu hình chung cho việc upload ảnh bằng Multer:
 * - storage: dùng memoryStorage() → file sẽ được lưu trong bộ nhớ RAM tạm thời,
 *   rồi chuyển tiếp lên Cloudinary (hoặc service khác). Không lưu file xuống disk local.
 * - limits: giới hạn dung lượng mỗi file tối đa 10MB.
 * - fileFilter: chỉ cho phép các định dạng ảnh hợp lệ (jpg, jpeg, png, webp).
 *   Nếu định dạng khác → throw BadRequestException.
 */
const imageUploadConfig = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn: 10MB mỗi ảnh
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    const ok = /^image\/(jpe?g|png|webp|avif)$/i.test(file.mimetype);
    // cb(error, acceptFile)
    cb(ok ? null : new BadRequestException('Invalid image type'), ok);
  },
};

/**
 * Interceptor cho upload 1 ảnh (field name = "file").
 * - Sử dụng trong Controller với @UseInterceptors(SingleImageUploadInterceptor)
 * - Khi dùng: request phải có multipart/form-data với 1 field "file"
 * - File sau khi được intercept sẽ có trong decorator @UploadedFile()
 */
export const SingleImageUploadInterceptor = FileInterceptor('file', imageUploadConfig);

/**
 * Interceptor cho upload nhiều ảnh cùng lúc (field name = "files").
 * - maxCount: số file tối đa được phép upload trong 1 request (mặc định = 10).
 * - Sử dụng trong Controller với @UseInterceptors(MultipleImageUploadInterceptor(maxCount))
 * - Khi dùng: request phải có multipart/form-data với nhiều field "files"
 * - Các file sau khi được intercept sẽ có trong decorator @UploadedFiles()
 */
export const MultipleImageUploadInterceptor = (maxCount: number = 10) =>
  FilesInterceptor('files', maxCount, imageUploadConfig);
