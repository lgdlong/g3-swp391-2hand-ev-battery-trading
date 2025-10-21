// Image upload validation and configuration constants
export const VALIDATION = {
  MAX_IMAGES: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// User-facing messages
export const MESSAGES = {
  INVALID_FILE_TYPE: (name: string) => `${name} không phải là file hình ảnh`,
  FILE_TOO_LARGE: (name: string) => `${name} quá lớn (tối đa 5MB)`,
  MAX_IMAGES_EXCEEDED: `Chỉ được tải lên tối đa ${VALIDATION.MAX_IMAGES} hình ảnh`,
  IMAGES_ADDED: (count: number) => `Đã thêm ${count} hình`,
  IMAGE_MARKED_DELETED: 'Đã đánh dấu xoá ảnh',
  IMAGE_REMOVED: 'Đã bỏ ảnh mới',
  UPLOAD_ERROR: 'Có lỗi khi thêm hình',
  UPLOADING: 'Đang tải lên...',
  SELECT_FILES: 'Chọn file',
} as const;

// CSS class configurations
export const CSS_CLASSES = {
  uploadArea: {
    base: 'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
    dragOver: 'border-primary bg-primary/5',
    normal: 'border-gray-300 hover:border-gray-400',
  },
  badge: {
    main: 'absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1 rounded',
    new: 'absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded',
  },
} as const;
