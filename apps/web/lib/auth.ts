import { ACCESS_TOKEN_KEY } from '@/config/constants';

export function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
}

export function getAuthHeaders() {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Authentication using token required!');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}
