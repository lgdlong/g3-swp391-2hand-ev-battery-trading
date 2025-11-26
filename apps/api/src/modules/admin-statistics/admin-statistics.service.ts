import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../wallets/entities/wallet.entity';
import { WalletTransaction } from '../wallets/entities/wallet-transaction.entity';
import { PostPayment } from '../transactions/entities';
import { ServiceType } from '../service-types/entities/service-type.entity';
import { FinancialOverviewDto, TransactionStatsDto, AdminDashboardStatsDto } from './dto';

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

    // Calculate total fees collected
    const totalFeesCollected = Number.parseFloat(totalDepositCollected).toString();

    // Total verification fees (feature removed - set to 0)
    const totalVerificationFees = '0';

    // Net revenue equals total fees collected
    const netRevenue = totalFeesCollected;

    return {
      totalWalletBalance,
      totalTopupAmount,
      totalWithdrawalAmount,
      totalTransactions,
      totalFeesCollected,
      totalDepositCollected,
      totalVerificationFees,
      netRevenue,
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

    // Total topup transactions
    const totalTopups = await this.walletTransactionRepo.count({
      where: { serviceTypeId: walletTopupService?.id },
    });

    return {
      totalTransactions,
      transactionsToday,
      totalPostPayments,
      totalTopups,
    };
  }

  /**
   * Get complete admin dashboard statistics
   */
  async getAdminDashboardStats(): Promise<AdminDashboardStatsDto> {
    const [financial, transactions] = await Promise.all([
      this.getFinancialOverview(),
      this.getTransactionStats(),
    ]);

    return {
      financial,
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
   * Get total amount for POST_PAYMENT service type
   */
  async getPostPaymentTotal(): Promise<string> {
    const postPaymentService = await this.serviceTypeRepo.findOne({
      where: { code: 'POST_PAYMENT' },
    });

    if (!postPaymentService) {
      return '0';
    }

    const result = await this.walletTransactionRepo
      .createQueryBuilder('wt')
      .select('SUM(ABS(CAST(wt.amount AS DECIMAL)))', 'total')
      .where('wt.service_type_id = :serviceTypeId', {
        serviceTypeId: postPaymentService.id,
      })
      .getRawOne();

    return result?.total || '0';
  }

  /**
   * Get total amount for PLATFORM_FEE service type
   */
  async getPlatformFeeTotal(): Promise<string> {
    const platformFeeService = await this.serviceTypeRepo.findOne({
      where: { code: 'PLATFORM_FEE' },
    });

    if (!platformFeeService) {
      return '0';
    }

    const result = await this.walletTransactionRepo
      .createQueryBuilder('wt')
      .select('SUM(ABS(CAST(wt.amount AS DECIMAL)))', 'total')
      .where('wt.service_type_id = :serviceTypeId', {
        serviceTypeId: platformFeeService.id,
      })
      .getRawOne();

    return result?.total || '0';
  }

  /**
   * Get total revenue (sum of POST_PAYMENT and PLATFORM_FEE)
   */
  async getTotalRevenue(): Promise<string> {
    const [postPaymentTotal, platformFeeTotal] = await Promise.all([
      this.getPostPaymentTotal(),
      this.getPlatformFeeTotal(),
    ]);

    const total =
      Number.parseFloat(postPaymentTotal || '0') + Number.parseFloat(platformFeeTotal || '0');

    return total.toString();
  }

  /**
   * Get monthly revenue (POST_PAYMENT + PLATFORM_FEE grouped by month)
   */
  async getMonthlyRevenue(): Promise<Array<{ month: string; revenue: string }>> {
    const [postPaymentService, platformFeeService] = await Promise.all([
      this.serviceTypeRepo.findOne({ where: { code: 'POST_PAYMENT' } }),
      this.serviceTypeRepo.findOne({ where: { code: 'PLATFORM_FEE' } }),
    ]);

    if (!postPaymentService || !platformFeeService) {
      return [];
    }

    const result = await this.walletTransactionRepo
      .createQueryBuilder('wt')
      .select("TO_CHAR(wt.created_at, 'YYYY-MM')", 'month')
      .addSelect('SUM(ABS(CAST(wt.amount AS DECIMAL)))', 'revenue')
      .where('wt.service_type_id IN (:...serviceTypeIds)', {
        serviceTypeIds: [postPaymentService.id, platformFeeService.id],
      })
      .groupBy("TO_CHAR(wt.created_at, 'YYYY-MM')")
      .orderBy("TO_CHAR(wt.created_at, 'YYYY-MM')", 'ASC')
      .getRawMany();

    return result.map((row) => ({
      month: row.month,
      revenue: row.revenue || '0',
    }));
  }
}
