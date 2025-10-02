import type { AccountUI, Account } from '@/types/account';

// We'll adapt the existing API response
type AccountDtoRaw = Account;

/**
 * Main adapter function: converts raw account DTO to UI interface
 * @param dto Raw account data from API
 * @returns Normalized AccountUI object
 */
export function adaptAccountDto(dto: AccountDtoRaw): AccountUI {
  return {
    id: dto.id,
    fullName: dto.fullName,
    email: dto.email || undefined,
    phone: dto.phone || undefined,
    avatarUrl: dto.avatarUrl || undefined,
    status: dto.status,
    role: dto.role,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
