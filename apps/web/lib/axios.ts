import axios from 'axios';
import { DEFAULT_API_BASE_URL } from '@/config/constants';
import { handleTokenExpiration } from '@/lib/auth-manager';

export const api = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 15000,
});

// Thêm interceptor để xử lý lỗi chung, lấy message từ backend response nếu có
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err?.response?.data?.message ?? err.message ?? 'Request failed';

    // Handle 401 Unauthorized - only treat as token expiration if there's an auth token
    if (err?.response?.status === 401) {
      // Check if there's an Authorization header (meaning user was logged in)
      const hasAuthToken = err?.config?.headers?.Authorization;

      // Only handle as token expiration if user was authenticated
      if (hasAuthToken) {
        console.log('Token expired, logging out...');
        handleTokenExpiration();
        return Promise.reject(new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'));
      }

      // Otherwise, it's a login failure - show the backend error message
      return Promise.reject(new Error(msg));
    }

    return Promise.reject(new Error(msg));
  },
);

// Thêm interceptor để xử lý lỗi chung, lấy message từ backend response nếu có
// api.interceptors.response.use(
//   (r) => r,
//   (err) => {
//     const msg = err?.response?.data?.message ?? err.message ?? 'Request failed';
//     return Promise.reject(new Error(msg));
//   },
// );
