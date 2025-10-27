import { useMutation } from '@tanstack/react-query';
import { uploadAvatar } from '@/lib/api/accountApi';
import { z } from 'zod';
import { validateAvatarFile } from '@/lib/validation/file-validation';

// Zod schema for avatar URL validation (server response validation)
const AvatarUrlSchema = z.object({
  avatarUrl: z
    .url('URL ảnh không hợp lệ')
    .startsWith('http', 'URL phải bắt đầu bằng http/https')
    .min(1, 'URL ảnh không được để trống'),
});

/**
 * Hook for avatar upload with comprehensive validation
 * Validates file on client-side before upload and server response after upload
 *
 * @param onSuccess - Callback when upload succeeds with avatar URL
 * @returns Mutation object for React Query
 */
export function useUploadAvatar(onSuccess?: (url: string) => void) {
  return useMutation({
    mutationFn: async (file: File) => {
      // Step 1: Client-side file validation (CRITICAL SECURITY CHECK)
      const fileValidation = validateAvatarFile(file);
      if (!fileValidation.isValid) {
        throw new Error(fileValidation.error);
      }

      // Step 2: Upload validated file (uploadAvatar also validates)
      const account = await uploadAvatar(file);

      if (!account) {
        throw new Error('Không thể kết nối đến máy chủ.');
      }

      // Step 3: Runtime validation of server response using Zod schema
      const validationResult = AvatarUrlSchema.safeParse(account);

      if (!validationResult.success) {
        const errorMessage = validationResult.error.issues.map((err) => err.message).join(', ');
        throw new Error(`Dữ liệu không hợp lệ từ máy chủ: ${errorMessage}`);
      }

      const { avatarUrl } = validationResult.data;
      return { url: avatarUrl };
    },
    onSuccess: (data) => onSuccess?.(data.url),
  });
}
