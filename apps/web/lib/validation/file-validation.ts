/**
 * File validation utilities for secure file uploads
 * Protects against malicious file uploads and DoS attacks
 */

// Security constants for file upload validation
export const AVATAR_VALIDATION = {
  // Whitelist of allowed MIME types
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const,
  // Maximum file size: 5MB
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  MAX_SIZE_MB: 5,
  // Allowed file extensions
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'] as const,
} as const;

export interface FileValidationError {
  isValid: false;
  error: string;
  code: 'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'INVALID_EXTENSION' | 'NO_FILE';
}

export interface FileValidationSuccess {
  isValid: true;
  file: File;
}

export type FileValidationResult = FileValidationSuccess | FileValidationError;

/**
 * Validates file for avatar upload
 * Checks: file existence, MIME type, file extension, and size
 *
 * @param file - File to validate
 * @returns Validation result with error details if invalid
 */
export function validateAvatarFile(file: File | null | undefined): FileValidationResult {
  // Check if file exists
  if (!file) {
    return {
      isValid: false,
      error: 'Vui lòng chọn một tệp ảnh',
      code: 'NO_FILE',
    };
  }

  // Validate MIME type against whitelist
  const allowedTypes: readonly string[] = AVATAR_VALIDATION.ALLOWED_TYPES;
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${AVATAR_VALIDATION.ALLOWED_TYPES.join(', ')}`,
      code: 'INVALID_TYPE',
    };
  }

  // Validate file extension (additional security layer)
  const fileName = file.name.toLowerCase();
  const hasValidExtension = AVATAR_VALIDATION.ALLOWED_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext),
  );

  if (!hasValidExtension) {
    return {
      isValid: false,
      error: `Phần mở rộng file không hợp lệ. Chỉ chấp nhận: ${AVATAR_VALIDATION.ALLOWED_EXTENSIONS.join(', ')}`,
      code: 'INVALID_EXTENSION',
    };
  }

  // Validate file size (prevent DoS attacks)
  if (file.size > AVATAR_VALIDATION.MAX_SIZE_BYTES) {
    return {
      isValid: false,
      error: `Kích thước file vượt quá giới hạn ${AVATAR_VALIDATION.MAX_SIZE_MB}MB. Kích thước hiện tại: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      code: 'FILE_TOO_LARGE',
    };
  }

  // All validations passed
  return {
    isValid: true,
    file,
  };
}

/**
 * Validates URL for avatar image
 * Prevents XSS and malicious URL injection
 *
 * @param url - URL to validate
 * @returns true if URL is safe, false otherwise
 */
export function isValidAvatarUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  try {
    const urlObj = new URL(url);

    // Only allow http and https protocols (prevent javascript:, data:, etc.)
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return false;
    }

    // Additional check: URL must start with http:// or https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }

    return true;
  } catch {
    // Invalid URL format
    return false;
  }
}

/**
 * Sanitizes avatar URL for safe rendering
 * Returns safe URL or fallback
 *
 * @param url - URL to sanitize
 * @param fallback - Fallback URL if validation fails
 * @returns Safe URL or fallback
 */
export function sanitizeAvatarUrl(
  url: string | null | undefined,
  fallback: string = '/default-avatar.png',
): string {
  return isValidAvatarUrl(url) ? url! : fallback;
}
