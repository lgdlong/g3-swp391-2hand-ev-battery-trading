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

    // Handle 401 Unauthorized - token expired or invalid
    if (err?.response?.status === 401) {
      console.log('Token expired, logging out...');
      handleTokenExpiration();
      return Promise.reject(new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'));
    }

    return Promise.reject(new Error(msg));
  },
  
);

