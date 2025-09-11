// apps/web/src/config/constants.ts
export const DEFAULT_API_BASE_URL = process.env.DEFAULT_API_BASE_URL || 'http://localhost:8000'; // URL mặc định cho backend API
export const DEFAULT_FRONTEND_URL = process.env.DEFAULT_FRONTEND_URL || 'http://localhost:3000'; // URL mặc định cho frontend
export const NEXT_PUBLIC_GOOGLE_AUTH_URL =
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL || 'http://localhost:8000/google'; // URL đăng nhập Google mặc định

export const ACCESS_TOKEN_KEY = 'access_token';
export const DEFAULT_AVATAR_URL = 'https://avatar.iran.liara.run/public';
