import { api } from '@/lib/axios';
import { LoginRequest, LoginResponse } from '@/types/login';
import { DEFAULT_API_BASE_URL } from '@/config/constants';

export async function loginApi({
  identifier,
  password,
}: {
  identifier: string;
  password: string;
}): Promise<LoginResponse> {
  const body: LoginRequest = { identifier, password };
  const { data } = await api.post<LoginResponse>('auth/login', body);
  return data;
}

export function getGoogleLoginUrl(): string {
  return `${DEFAULT_API_BASE_URL}/auth/google`;
}

export function initiateGoogleLogin(): void {
  const googleAuthUrl = getGoogleLoginUrl();
  // Redirect to backend Google OAuth endpoint
  window.location.href = googleAuthUrl;
}
