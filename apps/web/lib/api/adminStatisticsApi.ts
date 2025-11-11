import { api } from '@/lib/axios';
import { getAuthHeaders } from '@/lib/auth';
import type {
  AdminDashboardStatistics,
  FinancialOverview,
  FraudOverview,
  TransactionStats,
  TotalBalanceResponse,
  TotalTopupResponse,
  TotalDepositResponse,
  FraudCountResponse,
} from '@/types/admin-statistics';

/**
 * Get complete admin dashboard statistics
 * Returns all statistics in one call
 * Requires admin authentication
 */
export async function getAdminDashboardStatistics(): Promise<AdminDashboardStatistics> {
  try {
    const { data } = await api.get<AdminDashboardStatistics>('/admin/statistics/dashboard', {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error('Error fetching admin dashboard statistics:', error);
    throw error;
  }
}

/**
 * Get financial overview statistics
 * Includes wallet balances, fees, and revenue data
 * Requires admin authentication
 */
export async function getFinancialOverview(): Promise<FinancialOverview> {
  try {
    const { data } = await api.get<FinancialOverview>('/admin/statistics/financial', {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error('Error fetching financial overview:', error);
    throw error;
  }
}

/**
 * Get fraud and risk statistics
 * Includes fraud flags, refund rate, etc.
 * Requires admin authentication
 */
export async function getFraudOverview(): Promise<FraudOverview> {
  try {
    const { data } = await api.get<FraudOverview>('/admin/statistics/fraud', {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error('Error fetching fraud overview:', error);
    throw error;
  }
}

/**
 * Get transaction statistics
 * Includes transaction counts by type
 * Requires admin authentication
 */
export async function getTransactionStats(): Promise<TransactionStats> {
  try {
    const { data } = await api.get<TransactionStats>('/admin/statistics/transactions', {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    throw error;
  }
}

/**
 * Get total wallet balance across all users
 * Requires admin authentication
 */
export async function getTotalWalletBalance(): Promise<string> {
  try {
    const { data } = await api.get<TotalBalanceResponse>('/admin/statistics/wallet-balance', {
      headers: getAuthHeaders(),
    });
    return data.totalBalance;
  } catch (error) {
    console.error('Error fetching total wallet balance:', error);
    throw error;
  }
}

/**
 * Get total topup amount
 * Requires admin authentication
 */
export async function getTotalTopupAmount(): Promise<string> {
  try {
    const { data } = await api.get<TotalTopupResponse>('/admin/statistics/total-topup', {
      headers: getAuthHeaders(),
    });
    return data.totalTopup;
  } catch (error) {
    console.error('Error fetching total topup amount:', error);
    throw error;
  }
}

/**
 * Get total deposit collected from post payments
 * Requires admin authentication
 */
export async function getTotalDepositCollected(): Promise<string> {
  try {
    const { data } = await api.get<TotalDepositResponse>('/admin/statistics/total-deposit', {
      headers: getAuthHeaders(),
    });
    return data.totalDeposit;
  } catch (error) {
    console.error('Error fetching total deposit:', error);
    throw error;
  }
}

/**
 * Get fraud flag count by status
 * Requires admin authentication
 */
export async function getFraudCount(): Promise<FraudCountResponse> {
  try {
    const { data } = await api.get<FraudCountResponse>('/admin/statistics/fraud-count', {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error('Error fetching fraud count:', error);
    throw error;
  }
}
