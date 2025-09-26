import { ACCESS_TOKEN_KEY } from '@/config/constants';
import { toast } from 'sonner';

// Global logout function that can be called from anywhere
export function handleTokenExpiration() {
  // Clear token and user data
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem('user_data');

    // Show notification
    toast.info('Phiên đăng nhập đã hết hạn. Đang chuyển về trang chủ...');

    // Small delay before redirect for better UX
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  }
}

// Check if current page requires auth
export function isAuthRequiredPage(pathname: string): boolean {
  const authRequiredPaths = ['/profile', '/admin'];
  return authRequiredPaths.some((path) => pathname.startsWith(path));
}
