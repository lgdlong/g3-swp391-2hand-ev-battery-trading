export const DEFAULT_PORT_BACKEND = 8000; // Default port for the API server
export const DEFAULT_FRONTEND_URL = process.env.DEFAULT_FRONTEND_URL || 'http://localhost:3000'; // Default frontend URL
export const DEFAULT_API_BASE_URL = process.env.DEFAULT_API_BASE_URL || 'http://localhost:8000'; // Default API base
export const DEFAULT_SALT_ROUNDS = 12;
export const ROLES_KEY = 'roles';
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_AVATAR_URL = 'https://avatar.iran.liara.run/public';
export const DEFAULT_AUTHOR_NAME = 'Unknown';
export const DEFAULT_JWT_EXPIRATION_TIME = '15M';
export const DEFAULT_JWT_REFRESH_EXPIRATION_TIME = '30d';

export * from './vehicle';
