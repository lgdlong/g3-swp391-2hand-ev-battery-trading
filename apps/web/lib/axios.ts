import axios from 'axios';
import { DEFAULT_API_BASE_URL } from '@/config/constants';
import { handleTokenExpiration } from '@/lib/auth-manager';

export const api = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  // Don't force Content-Type globally; let axios set it based on payload
  headers: { Accept: 'application/json' },
  timeout: 15000,
});

// Thêm interceptor để xử lý lỗi chung, lấy message từ backend response nếu có
// Ensure correct Content-Type for JSON requests only
api.interceptors.request.use((config) => {
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
  if (!isFormData && config.headers && config.data && typeof config.data === 'object') {
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (err) => {
    const status = err?.response?.status;

    if (status === 401) {
      const hasAuthToken = Boolean(err?.config?.headers?.Authorization);

      if (hasAuthToken) {
        // Token expiration case
        handleTokenExpiration();
        return Promise.reject({
          code: 'TOKEN_EXPIRED',
          message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
          originalError: err,
        });
      }

      // Login failure - sanitize backend message
      const backendMsg = err?.response?.data?.message;
      const safeMsg =
        typeof backendMsg === 'string'
          ? backendMsg.slice(0, 200) // Limit length
          : 'Authentication failed';

      return Promise.reject({
        code: 'AUTH_FAILED',
        message: safeMsg,
        originalError: err,
      });
    }

    // Other errors
    return Promise.reject(err);
  },
);
