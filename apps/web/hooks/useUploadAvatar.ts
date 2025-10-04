import { useMutation } from '@tanstack/react-query';
import { uploadAvatar } from '@/lib/api';

export function useUploadAvatar(onSuccess?: (url: string) => void) {
  return useMutation({
    mutationFn: async (file: File) => {
      const account = await uploadAvatar(file);

      if (!account) {
        throw new Error('Không thể kết nối đến máy chủ.');
      }
      // chuẩn hoá vài key phổ biến từ Cloudinary/backend
      const url = account.avatarUrl;
      if (!url) throw new Error('Không tìm thấy URL ảnh trong phản hồi.');
      return { url } as { url: string };
    },
    onSuccess: (data) => onSuccess?.(data.url),
  });
}
