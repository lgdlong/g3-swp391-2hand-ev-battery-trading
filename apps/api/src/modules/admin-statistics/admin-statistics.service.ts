import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../wallets/entities/wallet.entity';
import { WalletTransaction } from '../wallets/entities/wallet-transaction.entity';
import { PostPayment } from '../transactions/entities';
import { ServiceType } from '../service-types/entities/service-type.entity';
import {
  FinancialOverviewDto,
  FraudOverviewDto,
  TransactionStatsDto,
  AdminDashboardStatsDto,
} from './dto';

@Injectable()
export class AdminStatisticsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepo: Repository<WalletTransaction>,
    @InjectRepository(PostPayment)
    private readonly postPaymentRepo: Repository<PostPayment>,
    @InjectRepository(ServiceType)
    private readonly serviceTypeRepo: Repository<ServiceType>,
  ) {}

  /**
   * Get financial overview statistics
   */
  async getFinancialOverview(): Promise<FinancialOverviewDto> {
    // Get total wallet balance
    const totalBalanceResult = await this.walletRepo
      .createQueryBuilder('wallet')
      .select('SUM(CAST(wallet.balance AS DECIMAL))', 'total')
      .getRawOne();

    const totalWalletBalance = totalBalanceResult?.total || '0';

    // Get service type IDs
    const walletTopupService = await this.serviceTypeRepo.findOne({
      where: { code: 'WALLET_TOPUP' },
    });
    const postVerificationService = await this.serviceTypeRepo.findOne({
      where: { code: 'POST_VERIFICATION' },
    });

    // Get total topup amount
    const topupResult = await this.walletTransactionRepo
      .createQueryBuilder('wt')
      .select('SUM(CAST(wt.amount AS DECIMAL))', 'total')
      .where('wt.service_type_id = :serviceTypeId', {
        serviceTypeId: walletTopupService?.id,
      })
      .andWhere('CAST(wt.amount AS DECIMAL) > 0')
      .getRawOne();

    const totalTopupAmount = topupResult?.total || '0';

    // Get total withdrawal amount (future feature - set to 0 for now)
    const totalWithdrawalAmount = '0';

    // Get total transactions count
    const totalTransactions = await this.walletTransactionRepo.count();

    // Get total deposit collected from post payments
    const depositResult = await this.postPaymentRepo
      .createQueryBuilder('pp')
      .select('SUM(CAST(pp.amount_paid AS DECIMAL))', 'total')
      .getRawOne();

    const totalDepositCollected = depositResult?.total || '0';

    // Get total verification fees
    const verificationResult = await this.walletTransactionRepo
      .createQueryBuilder('wt')
      .select('SUM(ABS(CAST(wt.amount AS DECIMAL)))', 'total')
      .where('wt.service_type_id = :serviceTypeId', {
        serviceTypeId: postVerificationService?.id,
      })
      .andWhere('CAST(wt.amount AS DECIMAL) < 0')
      .getRawOne();

    const totalVerificationFees = verificationResult?.total || '0';

    // Calculate total fees collected (post creation deposits + verification fees)
    const totalFeesCollected = (
      Number.parseFloat(totalDepositCollected) + Number.parseFloat(totalVerificationFees)
    ).toString();

    // No refunds in new business model - all fees are retained
    const totalRefundAmount = '0';

    // Net revenue = total fees collected (no refunds subtracted)
    const netRevenue = totalFeesCollected;

    return {
      totalWalletBalance,
      totalTopupAmount,
      totalWithdrawalAmount,
      totalTransactions,
      totalFeesCollected,
      totalDepositCollected,
      totalVerificationFees,
      totalRefundAmount,
      netRevenue,
    };
  }

  /**
   * Get fraud and risk statistics
   * Note: Fraud detection has been removed from the system
   */
  async getFraudOverview(): Promise<FraudOverviewDto> {
    // Fraud detection feature removed - return zero values
    return {
      totalFraudFlags: 0,
      suspectedCount: 0,
      confirmedCount: 0,
      refundRate: 0,
      totalRefundedPosts: 0,
    };
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(): Promise<TransactionStatsDto> {
    // Total wallet transactions
    const totalTransactions = await this.walletTransactionRepo.count();

    // Transactions today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const transactionsToday = await this.walletTransactionRepo
      .createQueryBuilder('wt')
      .where('wt.created_at >= :today', { today })
      .andWhere('wt.created_at < :tomorrow', { tomorrow })
      .getCount();

    // Total post payments
    const totalPostPayments = await this.postPaymentRepo.count();

    // Get service type IDs
    const walletTopupService = await this.serviceTypeRepo.findOne({
      where: { code: 'WALLET_TOPUP' },
    });
    const postVerificationService = await this.serviceTypeRepo.findOne({
      where: { code: 'POST_VERIFICATION' },
    });

    // Total topup transactions
    const totalTopups = await this.walletTransactionRepo.count({
      where: { serviceTypeId: walletTopupService?.id },
    });

    // Total verification transactions
    const totalVerifications = await this.walletTransactionRepo.count({
      where: { serviceTypeId: postVerificationService?.id },
    });

    return {
      totalTransactions,
      transactionsToday,
      totalPostPayments,
      totalTopups,
      totalVerifications,
    };
  }

  /**
   * Get complete admin dashboard statistics
   */
  async getAdminDashboardStats(): Promise<AdminDashboardStatsDto> {
    const [financial, fraud, transactions] = await Promise.all([
      this.getFinancialOverview(),
      this.getFraudOverview(),
      this.getTransactionStats(),
    ]);

    return {
      financial,
      fraud,
      transactions,
    };
  }

  /**
   * Get total wallet balance across all users
   */
  async getTotalWalletBalance(): Promise<string> {
    const result = await this.walletRepo
      .createQueryBuilder('wallet')
      .select('SUM(CAST(wallet.balance AS DECIMAL))', 'total')
      .getRawOne();

    return result?.total || '0';
  }

  /**
   * Get total topup amount
   */
  async getTotalTopupAmount(): Promise<string> {
    const walletTopupService = await this.serviceTypeRepo.findOne({
      where: { code: 'WALLET_TOPUP' },
    });

    const result = await this.walletTransactionRepo
      .createQueryBuilder('wt')
      .select('SUM(CAST(wt.amount AS DECIMAL))', 'total')
      .where('wt.service_type_id = :serviceTypeId', {
        serviceTypeId: walletTopupService?.id,
      })
      .andWhere('CAST(wt.amount AS DECIMAL) > 0')
      .getRawOne();

    return result?.total || '0';
  }

  /**
   * Get total deposit collected from post payments
   */
  async getTotalDepositCollected(): Promise<string> {
    const result = await this.postPaymentRepo
      .createQueryBuilder('pp')
      .select('SUM(CAST(pp.amount_paid AS DECIMAL))', 'total')
      .getRawOne();

    return result?.total || '0';
  }

  /**
   * Get fraud count
   * Note: Fraud detection has been removed from the system
   */
  async getFraudCount(): Promise<{ total: number; suspected: number; confirmed: number }> {
    // Fraud detection feature removed - return zero values
    return { total: 0, suspected: 0, confirmed: 0 };
  }

  /**
   * Get total revenue from post payments
   * Revenue = SUM(amount_paid) from post_payments table
   * Note: In the new business model, all fees are retained (no refunds)
   */
  async getTotalRevenue(): Promise<string> {
    const result = await this.postPaymentRepo
      .createQueryBuilder('pp')
      .select('SUM(CAST(pp.amount_paid AS DECIMAL))', 'total')
      .getRawOne();

    return result?.total || '0';
  }

  /**
   * Get daily fees collected for a specific month
   * Fees are calculated from WalletTransaction (POST_PAYMENT + POST_VERIFICATION service types)
   * These are platform fees deducted from user wallets, NOT actual revenue
   * Actual revenue comes from WALLET_TOPUP (money coming into the system)
   * Groups transactions by day within the specified month
   */
  async getDailyRevenueForMonth(
    year: number,
    month: number,
  ): Promise<{
    year: number;
    month: number;
    totalMonthRevenue: string;
    totalTransactions: number;
    dailyRevenue: Array<{
      day: number;
      date: string;
      revenue: string;
      transactionCount: number;
    }>;
  }> {
    // Get POST_PAYMENT and POST_VERIFICATION service types
    const [postPaymentService, postVerificationService] = await Promise.all([
      this.serviceTypeRepo.findOne({ where: { code: 'POST_PAYMENT' } }),
      this.serviceTypeRepo.findOne({ where: { code: 'POST_VERIFICATION' } }),
    ]);

    if (!postPaymentService || !postVerificationService) {
      throw new Error('Required service types not found');
    }

    // Calculate start and end dates for the month
    const startDate = new Date(year, month - 1, 1); // month is 0-indexed in Date
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of month

    // Get all transactions for this month with POST_PAYMENT and POST_VERIFICATION service types
    const transactions = await this.walletTransactionRepo
      .createQueryBuilder('wt')
      .select([
        'DATE(wt.created_at) as date',
        'SUM(ABS(CAST(wt.amount AS DECIMAL))) as revenue',
        'COUNT(*) as count',
      ])
      .where('wt.service_type_id IN (:...serviceTypeIds)', {
        serviceTypeIds: [postPaymentService.id, postVerificationService.id],
      })
      .andWhere('wt.created_at >= :startDate', { startDate })
      .andWhere('wt.created_at <= :endDate', { endDate })
      .andWhere('CAST(wt.amount AS DECIMAL) < 0') // Negative amounts are deductions (fees collected)
      .groupBy('DATE(wt.created_at)')
      .orderBy('DATE(wt.created_at)', 'ASC')
      .getRawMany();

    // Get total days in month
    const daysInMonth = new Date(year, month, 0).getDate();

    // Create a map of day -> fees
    const feesMap = new Map<number, { revenue: string; count: number }>();

    // Initialize all days with 0 fees
    for (let day = 1; day <= daysInMonth; day++) {
      feesMap.set(day, { revenue: '0', count: 0 });
    }

    // Populate map with actual transaction data
    let totalMonthFees = 0;
    let totalTransactions = 0;

    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date as string);
      const day = transactionDate.getDate();
      const fees = Number.parseFloat((transaction.revenue as string) || '0');
      const count = Number.parseInt((transaction.count as string) || '0', 10);

      feesMap.set(day, {
        revenue: Math.round(fees).toString(),
        count,
      });

      totalMonthFees += fees;
      totalTransactions += count;
    });

    // Convert map to array
    const dailyRevenue = Array.from(feesMap.entries()).map(([day, data]) => ({
      day,
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      revenue: data.revenue,
      transactionCount: data.count,
    }));

    return {
      year,
      month,
      totalMonthRevenue: Math.round(totalMonthFees).toString(),
      totalTransactions,
      dailyRevenue,
    };
  }
}
