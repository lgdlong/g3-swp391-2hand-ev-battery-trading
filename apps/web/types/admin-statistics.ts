// Admin Statistics API Response Types

/**
 * Financial Overview Statistics
 */
export interface FinancialOverview {
  totalWalletBalance: string;
  totalTopupAmount: string;
  totalWithdrawalAmount: string;
  totalTransactions: number;
  totalFeesCollected: string;
  totalDepositCollected: string;
  totalRefundAmount: string;
  netRevenue: string;
}

/**
 * Fraud & Risk Statistics
 */
export interface FraudOverview {
  totalFraudFlags: number;
  suspectedCount: number;
  confirmedCount: number;
  refundRate: number;
  totalRefundedPosts: number;
}

/**
 * Transaction Statistics
 */
export interface TransactionStats {
  totalTransactions: number;
  transactionsToday: number;
  totalPostPayments: number;
  totalTopups: number;
}

/**
 * Complete Admin Dashboard Statistics
 */
export interface AdminDashboardStatistics {
  financial: FinancialOverview;
  fraud: FraudOverview;
  transactions: TransactionStats;
}

/**
 * Simple response types for individual endpoints
 */
export interface TotalBalanceResponse {
  totalBalance: string;
}

export interface TotalTopupResponse {
  totalTopup: string;
}

export interface TotalDepositResponse {
  totalDeposit: string;
}

export interface FraudCountResponse {
  total: number;
  suspected: number;
  confirmed: number;
}
