import axios from 'axios';
import { ACCESS_TOKEN_KEY } from '@/config/constants';

const apiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for error handling
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle auth errors
    if (error.response?.status === 401) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default apiInstance;
export { apiInstance as api };
