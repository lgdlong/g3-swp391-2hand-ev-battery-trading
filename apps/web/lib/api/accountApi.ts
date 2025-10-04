import type { Account, CreateAccountDto } from '@/types/account';
import { api } from '@/lib/axios';
import { getAuthHeaders } from '../auth';
import { AccountRole as RoleEnum, AccountStatus as StatusEnum } from '@/types/enums/account-enum';
import { validateAvatarFile } from '@/lib/validation/file-validation';
import { AxiosError } from 'axios';

// Update current user profile
export interface UpdateProfileDto {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}

export async function createAccount(payload: CreateAccountDto): Promise<Account> {
  const { data } = await api.post<Account>('/accounts', payload);
  return data;
}

// Get all accounts with pagination
export async function getAccounts(limit?: number, offset?: number): Promise<Account[]> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());

  const { data } = await api.get<Account[]>(`/accounts?${params.toString()}`);
  return data;
}

// Get account by ID (public) - accepts string or number
export async function getAccountById(id: string | number): Promise<Account> {
  const { data } = await api.get<Account>(`/accounts/${id}`);
  return data;
}

// Get account by email (public)
export async function getAccountByEmail(email: string): Promise<Account> {
  const { data } = await api.get<Account>(`/accounts/email/${email}`);
  return data;
}

// Update account (auth)
export async function updateAccount(id: number, payload: Partial<Account>): Promise<Account> {
  const { data } = await api.patch<Account>(`/accounts/${id}`, payload, {
    headers: getAuthHeaders(),
  });
  return data;
}

// Delete account (Admin only)
export async function deleteAccount(id: number): Promise<void> {
  await api.delete(`/accounts/${id}`, {
    headers: getAuthHeaders(),
  });
}

// Get current user account (auth)
export async function getCurrentAccount(): Promise<Account> {
  const { data } = await api.get<Account>('/accounts/me', {
    headers: getAuthHeaders(),
  });
  return data;
}

// Update current user account (auth)
export async function updateCurrentAccount(payload: Partial<Account>): Promise<Account> {
  const { data } = await api.patch<Account>('/accounts/me', payload, {
    headers: getAuthHeaders(),
  });
  return data;
}

//  promote (admin auth)
export async function promoteAccount(id: number): Promise<Account> {
  const { data } = await api.patch<Account>(
    `/accounts/${id}/promote`,
    {},
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

// demote (admin auth)
export async function demoteAccount(id: number): Promise<Account> {
  const { data } = await api.patch<Account>(
    `/accounts/${id}/demote`,
    {},
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

// ban (admin auth)
export async function banAccount(id: number): Promise<Account> {
  const { data } = await api.patch<Account>(
    `/accounts/${id}/ban`,
    {},
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

// unban (admin auth)
export async function unbanAccount(id: number): Promise<Account> {
  const { data } = await api.patch<Account>(
    `/accounts/${id}/unban`,
    {},
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

// ===== Helpers tiện dùng trong UI ====
export async function toggleBan(id: number, current: StatusEnum): Promise<Account> {
  return current === StatusEnum.BANNED ? unbanAccount(id) : banAccount(id);
}

export async function setRole(id: number, role: RoleEnum): Promise<Account> {
  if (role === RoleEnum.ADMIN) return promoteAccount(id);
  if (role === RoleEnum.USER) return demoteAccount(id);
  // Throw an error for unhandled roles to avoid unexpected behavior
  throw new Error(`Role change to "${role}" is not supported.`);
}

/////////////////////////////////////////////////////////////
/**
 * Get current user profile information
 * Requires authentication token in headers
 */
export async function getCurrentUser(): Promise<Account> {
  const { data } = await api.get<Account>('/accounts/me', {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Upload avatar with comprehensive validation and error handling
 * Validates file type, size, and extension before upload
 * Handles specific HTTP error codes with user-friendly messages
 *
 * @param file - Avatar image file
 * @returns Updated account with new avatar URL
 * @throws Error with user-friendly message for various failure scenarios
 */
export async function uploadAvatar(file: File): Promise<Account> {
  // Step 1: Client-side validation (first line of defense)
  const validation = validateAvatarFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Step 2: Prepare form data
  const form = new FormData();
  form.append('file', file);

  // Step 3: Upload with comprehensive error handling
  try {
    const { data } = await api.post<Account>('/accounts/me/avatar', form, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });

    // Validate response has avatarUrl
    if (!data || !data.avatarUrl) {
      throw new Error('Server không trả về URL ảnh đại diện');
    }

    return data;
  } catch (error) {
    // Handle Axios errors with specific status codes
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const requestId = error.response?.headers?.['x-request-id'];

      // Log for debugging (include request-id if available)
      console.error('[uploadAvatar] Error:', {
        status,
        requestId,
        message: error.message,
        data: error.response?.data,
      });

      // Map status codes to user-friendly messages
      switch (status) {
        case 401:
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        case 413:
          throw new Error('Kích thước file quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB');
        case 415:
          throw new Error('Định dạng file không được hỗ trợ. Chỉ chấp nhận: JPG, PNG, WEBP');
        case 422:
          throw new Error(error.response?.data?.message || 'Dữ liệu không hợp lệ');
        case 500:
          throw new Error('Lỗi máy chủ. Vui lòng thử lại sau');
        case 503:
          throw new Error('Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau');
        default:
          throw new Error(
            error.response?.data?.message || 'Không thể tải ảnh lên. Vui lòng thử lại',
          );
      }
    }

    // Handle network errors
    if (error instanceof Error) {
      if (error.message.includes('Network')) {
        throw new Error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet');
      }
      throw error;
    }

    // Fallback for unknown errors
    throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại');
  }
}
