import { api } from '@/lib/axios';
import { getAuthHeaders } from '../auth';

// Types based on backend entities
export interface Wallet {
  userId: number;
  balance: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: number;
  walletUserId: number;
  amount: string;
  serviceTypeId: number;
  description: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  createdAt: string;
  serviceType?: {
    id: number;
    code: string;
    name: string;
  };
}

export interface CreateTopupDto {
  amount: number;
  returnUrl?: string;
  cancelUrl?: string;
}

/**
 * Get current user's wallet
 */
export async function getMyWallet(): Promise<Wallet> {
  const { data } = await api.get<Wallet>('/wallets/me', {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Create topup payment link via PayOS
 */
export async function createTopupPayment(
  payload: CreateTopupDto,
): Promise<{ data?: { checkoutUrl?: string } }> {
  const { data } = await api.post('/wallets/topup/payment', payload, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Get current user's wallet transactions
 */
export async function getMyTransactions(
  limit: number = 20,
  offset: number = 0,
): Promise<WalletTransaction[]> {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  const { data } = await api.get<WalletTransaction[]>(
    `/wallets/transactions/me?${params.toString()}`,
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

export async function getTransactionById(id: number): Promise<WalletTransaction> {
  const { data } = await api.get<WalletTransaction>(`/wallets/transactions/me/${id}`, {
    headers: getAuthHeaders(),
  });
  return data;
}

export async function getTransactionByOrderCode(orderCode: string): Promise<WalletTransaction> {
  const { data } = await api.get<WalletTransaction>(
    `/wallets/transactions/orderCode/${orderCode}`,
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}
