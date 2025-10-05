// apps/web/src/config/constants.ts
export const DEFAULT_API_BASE_URL = process.env.DEFAULT_API_BASE_URL || 'http://localhost:8000'; // URL mặc định cho backend API
export const DEFAULT_FRONTEND_URL = process.env.DEFAULT_FRONTEND_URL || 'http://localhost:3000'; // URL mặc định cho frontend
export const NEXT_PUBLIC_GOOGLE_AUTH_URL =
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL || 'http://localhost:8000/google'; // URL đăng nhập Google mặc định

export const ACCESS_TOKEN_KEY = 'access_token';
export const DEFAULT_AVATAR_URL = 'https://avatar.iran.liara.run/public';

// Avatar upload security constants
export const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const AVATAR_MAX_SIZE_MB = 5;
export const AVATAR_MAX_SIZE_BYTES = AVATAR_MAX_SIZE_MB * 1024 * 1024;

// Allowed image domains for Next.js Image component
export const ALLOWED_IMAGE_DOMAINS = [
  'res.cloudinary.com',
  'lh3.googleusercontent.com',
  'avatar.iran.liara.run',
];
