import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../wallets/entities/wallet.entity';
import { WalletTransaction } from '../wallets/entities/wallet-transaction.entity';
import { PostPayment } from '../transactions/entities';
import { PostFraudFlag } from '../post-fraud-flags/entities/post-fraud-flag.entity';
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
    @InjectRepository(PostFraudFlag)
    private readonly fraudFlagRepo: Repository<PostFraudFlag>,
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

    // Calculate total fees collected
    const totalFeesCollected = (
      Number.parseFloat(totalDepositCollected) + Number.parseFloat(totalVerificationFees)
    ).toString();

    // Get total refund amount (from wallet transactions with positive amounts after post creation)
    // This would need to track refund transactions specifically
    // For now, we'll calculate based on refund-related transactions
    const totalRefundAmount = '0'; // TODO: Implement refund tracking

    // Calculate net revenue
    const netRevenue = (
      Number.parseFloat(totalFeesCollected) - Number.parseFloat(totalRefundAmount)
    ).toString();

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
   */
  async getFraudOverview(): Promise<FraudOverviewDto> {
    // Get total fraud flags
    const totalFraudFlags = await this.fraudFlagRepo.count();

    // Get suspected fraud count
    const suspectedCount = await this.fraudFlagRepo.count({
      where: { status: 'SUSPECTED' },
    });

    // Get confirmed fraud count
    const confirmedCount = await this.fraudFlagRepo.count({
      where: { status: 'CONFIRMED' },
    });

    // Calculate refund rate
    // Total posts with payments
    const totalPostPayments = await this.postPaymentRepo.count();

    // Total refunded posts (this would need a refund tracking table)
    // For now, we'll estimate based on cancelled posts with fraud flags
    const totalRefundedPosts = 0; // TODO: Implement refund tracking

    const refundRate = totalPostPayments > 0 ? (totalRefundedPosts / totalPostPayments) * 100 : 0;

    return {
      totalFraudFlags,
      suspectedCount,
      confirmedCount,
      refundRate: Number(refundRate.toFixed(2)),
      totalRefundedPosts,
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
   */
  async getFraudCount(): Promise<{ total: number; suspected: number; confirmed: number }> {
    const total = await this.fraudFlagRepo.count();
    const suspected = await this.fraudFlagRepo.count({
      where: { status: 'SUSPECTED' },
    });
    const confirmed = await this.fraudFlagRepo.count({
      where: { status: 'CONFIRMED' },
    });

    return { total, suspected, confirmed };
  }
}
