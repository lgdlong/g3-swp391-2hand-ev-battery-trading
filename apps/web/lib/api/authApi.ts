import { api } from '@/lib/axios';
import { LoginRequest, LoginResponse } from '@/types/login';

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
