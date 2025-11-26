import { api } from '@/lib/axios';
import { getAuthHeaders } from '../auth';

// Contract Status enum
export enum ContractStatus {
  AWAITING_CONFIRMATION = 'AWAITING_CONFIRMATION',
  SUCCESS = 'SUCCESS',
  FORFEITED_EXTERNAL = 'FORFEITED_EXTERNAL',
  PENDING_REFUND = 'PENDING_REFUND',
}

// Contract Types
export interface Contract {
  id: string;
  listingId: string;
  orderId: string | null;
  buyerId: number;
  sellerId: number;
  status: ContractStatus;
  isExternalTransaction: boolean;
  buyerConfirmedAt: string | null;
  sellerConfirmedAt: string | null;
  confirmedAt: string | null;
  filePath: string | null;
  listingSnapshot: Record<string, any> | null;
  feeRate: string | null;
  hash: string | null;
  signaturePlaceholder: string | null;
  createdAt: string;
  updatedAt: string;
  buyer?: {
    id: number;
    fullName: string;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
  };
  seller?: {
    id: number;
    fullName: string;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
  };
}

export interface ConfirmContractDto {
  note?: string;
}

export interface CreateContractDto {
  listingId: string;
}

export interface CreateContractBySellerDto {
  listingId: string;
  buyerId: number;
  isExternalTransaction?: boolean;
}

/**
 * Create a new contract for a post (Buyer)
 */
export async function createContract(listingId: string): Promise<Contract> {
  const { data } = await api.post<Contract>(
    '/transactions/contracts',
    { listingId },
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

/**
 * Create contract by seller (Chốt đơn)
 */
export async function createContractBySeller(
  listingId: string,
  buyerId: number,
  isExternalTransaction: boolean = false,
): Promise<Contract> {
  const { data } = await api.post<Contract>(
    '/transactions/contracts/seller',
    { listingId, buyerId, isExternalTransaction },
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

/**
 * Get contract by order ID
 */
export async function getContractByOrderId(orderId: string): Promise<Contract | null> {
  const { data } = await api.get<Contract | null>(`/transactions/contracts/by-order/${orderId}`, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Check if a post has been paid for
 */
export async function checkPostPayment(
  postId: string,
): Promise<{ postId: string; isPaid: boolean }> {
  const { data } = await api.get<{ postId: string; isPaid: boolean }>(
    `/transactions/post-payments/check/${postId}`,
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

/**
 * Get contract by buyer and listing ID (for buyer to see their contract)
 */
export async function getContractByBuyerAndListing(listingId: string): Promise<Contract | null> {
  const { data } = await api.get<Contract | null>(
    `/transactions/contracts/by-listing/${listingId}/buyer`,
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

/**
 * Get contract by listing ID and buyer ID (for seller to see contract with specific buyer)
 */
export async function getContractByListingAndBuyer(
  listingId: string,
  buyerId: number,
): Promise<Contract | null> {
  const { data } = await api.get<Contract | null>(
    `/transactions/contracts/by-listing/${listingId}/buyer/${buyerId}`,
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

/**
 * Get contracts by listing ID (for seller)
 */
export async function getContractsByListingId(listingId: string): Promise<Contract[]> {
  const { data } = await api.get<Contract[]>(`/transactions/contracts/by-listing/${listingId}`, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Get all contracts for seller
 */
export async function getSellerContracts(): Promise<Contract[]> {
  const { data } = await api.get<Contract[]>(`/transactions/contracts/seller`, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Get all contracts for buyer
 */
export async function getBuyerContracts(): Promise<Contract[]> {
  const { data } = await api.get<Contract[]>(`/transactions/contracts/buyer`, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Get contract by ID
 */
export async function getContract(contractId: string): Promise<Contract> {
  const { data } = await api.get<Contract>(`/transactions/contracts/${contractId}`, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Buyer confirms receipt
 */
export async function confirmByBuyer(
  contractId: string,
  dto?: ConfirmContractDto,
): Promise<Contract> {
  const { data } = await api.post<Contract>(
    `/transactions/contracts/${contractId}/buyer/confirm`,
    dto || {},
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

/**
 * Seller confirms delivery
 */
export async function confirmBySeller(
  contractId: string,
  dto?: ConfirmContractDto,
): Promise<Contract> {
  const { data } = await api.post<Contract>(
    `/transactions/contracts/${contractId}/seller/confirm`,
    dto || {},
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

/**
 * Seller reports sold outside the system
 */
export async function forfeitExternal(contractId: string): Promise<Contract> {
  const { data } = await api.post<Contract>(
    `/transactions/contracts/${contractId}/seller/forfeit-external`,
    {},
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

/**
 * Initiate contract confirmation flow (Seller starts Flow F)
 * @param listingId - Post/listing ID
 * @param conversationId - Conversation ID with the buyer
 */
export async function initiateConfirmation(
  listingId: string,
  conversationId: number,
): Promise<Contract> {
  const { data } = await api.post<Contract>(
    '/transactions/contracts/initiate-confirmation',
    { listingId, conversationId },
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

/**
 * Buyer agrees to contract (completes Flow F)
 * @param contractId - Contract ID
 */
export async function agreeToContract(contractId: string): Promise<Contract> {
  const { data } = await api.post<Contract>(
    `/transactions/contracts/${contractId}/agree`,
    {},
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}
