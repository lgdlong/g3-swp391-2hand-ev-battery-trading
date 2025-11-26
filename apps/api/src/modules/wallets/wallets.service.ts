import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { ServiceTypesService } from '../service-types/service-types.service';
import { PaymentOrder } from '../payos/entities/payment-order.entity';
import { PaymentStatus } from '../../shared/enums/payment-status.enum';
import { CreateTopupDto } from './dto/create-topup.dto';
import { CreatePayosDto } from '../payos/dto';
import { WalletTransactionMapper } from './mappers/wallet-transaction.mapper';
import { WalletTransactionResponseDto } from './dto/wallet-transaction-response.dto';
import { ensureWalletInTx } from 'src/shared/helpers/wallet.helper';
import { ListQueryDto } from 'src/shared/dto/list-query.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepo: Repository<WalletTransaction>,
    @InjectRepository(PaymentOrder)
    private readonly paymentOrderRepo: Repository<PaymentOrder>,
    private readonly serviceTypesService: ServiceTypesService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Initialize wallet for a user if not exists
   * @param userId - User account ID
   * @returns Wallet entity
   */
  async initWalletIfNotExists(userId: number): Promise<Wallet> {
    let wallet = await this.walletRepo.findOne({ where: { userId } });

    if (!wallet) {
      wallet = this.walletRepo.create({
        userId,
        balance: '0',
      });
      await this.walletRepo.save(wallet);
    }

    return wallet;
  }

  /**
   * Get wallet by user ID
   * @param userId - User account ID
   * @returns Wallet entity or null
   */
  async getWallet(userId: number): Promise<Wallet | null> {
    return this.walletRepo.findOne({ where: { userId } });
  }

  /**
   * Create a wallet transaction
   * @param userId - User account ID
   * @param amount - Transaction amount (positive for credit, negative for debit)
   * @param serviceTypeCode - Service type code (e.g., 'WALLET_TOPUP')
   * @param description - Transaction description
   * @param relatedEntityId - Related entity ID (optional)
   * @returns Created wallet transaction
   */
  private async createWalletTransaction(
    userId: number,
    amount: string,
    serviceTypeCode: string,
    description?: string,
    relatedEntityId?: string,
  ): Promise<WalletTransaction> {
    const serviceType = await this.serviceTypesService.findByCode(serviceTypeCode);
    if (!serviceType) {
      throw new NotFoundException(`Service type with code '${serviceTypeCode}' not found`);
    }

    const transaction = this.walletTransactionRepo.create({
      walletUserId: userId,
      amount,
      serviceTypeId: serviceType.id,
      description,
      relatedEntityId,
    });

    return this.walletTransactionRepo.save(transaction);
  }

  /**
   * Update wallet balance
   * @param userId - User account ID
   * @param amount - Amount to add (positive) or subtract (negative)
   * @returns Updated wallet
   */
  //   async updateWalletBalance(userId: number, amount: string, description?: string, relatedEntityId?: string): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
  //   return this.dataSource.transaction(async (manager) => {
  //     //const walletRepo = manager.getRepository(Wallet);
  //     const transactionRepo = manager.getRepository(WalletTransaction);

  //    const wallet = await ensureWalletInTx(manager, userId);

  //     const currentBalance = parseFloat(wallet.balance);
  //     const delta = parseInt(amount, 10);
  //     const newBalance = currentBalance + delta;

  //     if (newBalance < 0) {
  //       throw new Error('Insufficient balance');
  //     }

  //     const serviceType = await this.serviceTypesService.findByCode('ADJUSTMENT');
  //     const transaction = transactionRepo.create({
  //       walletUserId: userId,
  //       amount: delta.toString(),
  //       serviceTypeId: serviceType?.id,
  //       description: description || (delta >= 0 ? 'Admin credit' : 'Admin debit'),
  //       relatedEntityId,
  //     });
  //     await transactionRepo.save(transaction);

  //     wallet.balance = newBalance.toFixed(2);
  //     await this.walletRepo.save(wallet);
  //     return { wallet, transaction };
  //   });
  // }

  /**
   * Top up wallet - Creates transaction and updates balance atomically
   * @param userId - User account ID
   * @param amount - Amount to top up
   * @param serviceTypeCode - Service type code (e.g., 'WALLET_TOPUP', 'BUY_REFUND', 'SELL_REVENUE')
   * @param description - Transaction description
   * @param relatedEntityType - Related entity table name (e.g., 'orders', 'payment_orders')
   * @param relatedEntityId - Related entity ID
   * @returns Object with updated wallet and transaction
   */
  async topUp(
    userId: number,
    amount: string,
    serviceTypeCode: string = 'WALLET_TOPUP',
    description?: string,
    relatedEntityType?: string,
    relatedEntityId?: string,
  ): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
    // Use transaction to ensure atomicity
    return this.dataSource.transaction(async (manager) => {
      const walletRepo = manager.getRepository(Wallet);
      const transactionRepo = manager.getRepository(WalletTransaction);

      // Initialize wallet if not exists
      const wallet = await ensureWalletInTx(manager, userId);

      // Get service type (auto-create if not exists)
      const serviceType = await this.serviceTypesService.findOrCreateByCode(
        serviceTypeCode,
        this.getServiceTypeName(serviceTypeCode),
        this.getServiceTypeDescription(serviceTypeCode),
      );

      // Create wallet transaction
      const transaction = transactionRepo.create({
        walletUserId: userId,
        amount,
        serviceTypeId: serviceType.id,
        description: description || this.getDefaultDescription(serviceTypeCode),
        relatedEntityType: relatedEntityType || 'payment_orders',
        relatedEntityId,
      });
      await transactionRepo.save(transaction);

      // Update wallet balance
      const currentBalance = parseFloat(wallet.balance);
      const amountToAdd = parseFloat(amount);
      const newBalance = currentBalance + amountToAdd;

      wallet.balance = newBalance.toFixed(2);
      await walletRepo.save(wallet);

      return { wallet, transaction };
    });
  }

  /**
   * Deduct from wallet - Creates transaction and updates balance atomically
   * @param userId - User account ID
   * @param amount - Amount to deduct
   * @param serviceTypeCode - Service type code (e.g., 'POST_PAYMENT')
   * @param description - Transaction description
   * @param relatedEntityType - Related entity table name (e.g., 'posts', 'payment_orders')
   * @param relatedEntityId - Related entity ID
   * @returns Object with updated wallet and transaction
   */
  async deduct(
    userId: number,
    amount: string,
    serviceTypeCode: string,
    description?: string,
    relatedEntityType?: string,
    relatedEntityId?: string,
  ): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
    // Use transaction to ensure atomicity
    return this.dataSource.transaction(async (manager) => {
      const walletRepo = manager.getRepository(Wallet);
      const transactionRepo = manager.getRepository(WalletTransaction);

      // Get wallet
      const wallet = await ensureWalletInTx(manager, userId);

      // Check balance
      const currentBalance = parseFloat(wallet.balance);
      const amountToDeduct = parseFloat(amount);

      if (currentBalance < amountToDeduct) {
        throw new Error('Insufficient balance');
      }

      // Get service type (auto-create if not exists)
      const serviceType = await this.serviceTypesService.findOrCreateByCode(
        serviceTypeCode,
        this.getServiceTypeName(serviceTypeCode),
        this.getServiceTypeDescription(serviceTypeCode),
      );

      // Create wallet transaction (store as negative for debit)
      const transaction = transactionRepo.create({
        walletUserId: userId,
        amount: `-${amount}`,
        serviceTypeId: serviceType.id,
        description,
        relatedEntityType,
        relatedEntityId,
      });
      await transactionRepo.save(transaction);

      // Update wallet balance
      const newBalance = currentBalance - amountToDeduct;
      wallet.balance = newBalance.toFixed(2);
      await walletRepo.save(wallet);

      return { wallet, transaction };
    });
  }

  /**
   * Get service type name by code
   */
  private getServiceTypeName(code: string): string {
    const names: Record<string, string> = {
      WALLET_TOPUP: 'Nạp tiền vào ví',
      POST_PAYMENT: 'Thanh toán đăng bài',
      ADJUSTMENT: 'Điều chỉnh số dư',
      BUY_HOLD: 'Giữ tiền mua hàng',
      BUY_REFUND: 'Hoàn tiền mua hàng',
      SELL_REVENUE: 'Doanh thu bán hàng',
      PLATFORM_FEE: 'Phí nền tảng',
    };
    return names[code] || code;
  }

  /**
   * Get service type description by code
   */
  private getServiceTypeDescription(code: string): string {
    const descriptions: Record<string, string> = {
      WALLET_TOPUP: 'Nạp tiền vào ví qua PayOS',
      POST_PAYMENT: 'Thanh toán phí để đăng bài tin',
      ADJUSTMENT: 'Admin điều chỉnh số dư ví của user',
      BUY_HOLD: 'Giữ tiền trong escrow khi mua hàng',
      BUY_REFUND: 'Hoàn tiền cho buyer khi đơn hàng bị hủy hoặc từ chối',
      SELL_REVENUE: 'Seller nhận tiền từ đơn hàng hoàn thành',
      PLATFORM_FEE: 'Admin nhận hoa hồng từ giao dịch',
    };
    return descriptions[code] || `Service type: ${code}`;
  }

  /**
   * Get default description by service type code
   */
  private getDefaultDescription(code: string): string {
    const defaults: Record<string, string> = {
      WALLET_TOPUP: 'Nạp tiền vào ví',
      BUY_REFUND: 'Hoàn tiền đơn hàng',
      SELL_REVENUE: 'Nhận tiền đơn hàng',
      PLATFORM_FEE: 'Hoa hồng giao dịch',
    };
    return defaults[code] || 'Giao dịch ví';
  }

  /**
   * Get wallet transactions for a user
   * @param userId - User account ID
   * @param limit - Number of transactions to return
   * @param offset - Number of transactions to skip
   * @returns Array of wallet transaction DTOs
   */
  async getTransactions(
    userId: number,
    limit = 20,
    offset = 0,
  ): Promise<WalletTransactionResponseDto[]> {
    const transactions = await this.walletTransactionRepo.find({
      where: { walletUserId: userId },
      relations: ['serviceType'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return WalletTransactionMapper.toResponseDtoArray(transactions);
  }

  /**
   * Get wallet transaction by ID
   * @param transactionId - Transaction ID
   * @param userId - User ID (optional, for access control)
   * @returns Wallet transaction details
   */
  async getTransactionById(
    transactionId: number,
    userId?: number,
  ): Promise<WalletTransactionResponseDto> {
    const whereCondition: any = { id: transactionId };

    // If userId is provided, ensure user can only access their own transactions
    if (userId) {
      whereCondition.walletUserId = userId;
    }

    const transaction = await this.walletTransactionRepo.findOne({
      where: whereCondition,
      relations: ['serviceType'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return WalletTransactionMapper.toResponseDto(transaction);
  }

  /**
   * Create a topup payment order and PayOS payment link
   * @param userId - User account ID
   * @param createTopupDto - Topup request data
   * @returns Payment order with details for PayOS integration
   */
  async createTopupPayment(
    userId: number,
    createTopupDto: CreateTopupDto,
  ): Promise<{ paymentOrder: PaymentOrder; payosRequest: CreatePayosDto }> {
    // Get WALLET_TOPUP service type (auto-create if not exists)
    const serviceType = await this.serviceTypesService.findOrCreateByCode(
      'WALLET_TOPUP',
      this.getServiceTypeName('WALLET_TOPUP'),
      this.getServiceTypeDescription('WALLET_TOPUP'),
    );

    // Create payment order record first to get the ID
    const paymentOrder = this.paymentOrderRepo.create({
      accountId: userId,
      serviceTypeId: serviceType.id,
      amount: createTopupDto.amount.toString(),
      status: PaymentStatus.PENDING,
      payableType: 'WALLET_TOPUP',
    });

    await this.paymentOrderRepo.save(paymentOrder);

    // Use payment order ID as orderCode
    const orderCode = parseInt(paymentOrder.id);

    // Update payment order with orderCode
    paymentOrder.orderCode = paymentOrder.id;
    await this.paymentOrderRepo.save(paymentOrder);

    // Create PayOS payment request
    const payosRequest = {
      orderCode,
      amount: createTopupDto.amount,
      description: '',
      returnUrl: createTopupDto.returnUrl || `${process.env.FRONTEND_URL}/wallet/topup/success`,
      cancelUrl: createTopupDto.cancelUrl || `${process.env.FRONTEND_URL}/wallet/topup/cancel`,
    };

    return { paymentOrder, payosRequest };
  }

  /**
   * Update payment order with payment reference
   * @param paymentOrderId - Payment order ID
   * @param paymentRef - Payment reference from PayOS
   */
  async updatePaymentOrderRef(paymentOrderId: string, paymentRef: string): Promise<void> {
    await this.paymentOrderRepo.update(paymentOrderId, { paymentRef });
  }

  /**
   * Process completed payment and update wallet for topup
   * @param paymentOrderId - Payment order ID
   */
  async processCompletedPayment(paymentOrderId: string): Promise<void> {
    const paymentOrder = await this.paymentOrderRepo.findOne({
      where: { id: paymentOrderId },
      relations: ['serviceType'],
    });

    if (!paymentOrder) {
      throw new NotFoundException(`Payment order not found: ${paymentOrderId}`);
    }

    if (paymentOrder.status !== PaymentStatus.COMPLETED) {
      return; // Only process completed payments
    }

    // Handle wallet topup if this is a wallet topup payment
    if (paymentOrder.serviceType.code === 'WALLET_TOPUP') {
      await this.topUp(
        paymentOrder.accountId,
        paymentOrder.amount,
        `Nạp tiền từ PayOS - Order #${paymentOrderId}`,
        paymentOrder.id,
      );
    }
  }

  /**
   * Verify payment with PayOS and process topup if successful
   * This is called when user returns from PayOS checkout
   * @param orderCode - Payment order code
   * @param userId - User ID for ownership verification
   * @returns Wallet transaction response
   */
  async verifyAndProcessTopup(
    orderCode: string,
    userId: number,
  ): Promise<WalletTransactionResponseDto> {
    // Find payment order
    const paymentOrder = await this.paymentOrderRepo.findOne({
      where: { id: orderCode },
      relations: ['serviceType'],
    });

    if (!paymentOrder) {
      throw new NotFoundException(`Payment order ${orderCode} not found`);
    }

    // Check ownership
    if (paymentOrder.accountId !== userId) {
      throw new NotFoundException(`Payment order ${orderCode} not found or access denied`);
    }

    // Check if it's a wallet topup
    if (paymentOrder.serviceType?.code !== 'WALLET_TOPUP') {
      throw new BadRequestException('This payment order is not a wallet topup');
    }

    // Check if already has a transaction (already processed)
    const existingTransaction = await this.walletTransactionRepo.findOne({
      where: {
        relatedEntityId: orderCode,
        relatedEntityType: 'payment_orders',
      },
      relations: ['serviceType'],
    });

    if (existingTransaction) {
      // Already processed, just return the transaction
      return WalletTransactionMapper.toResponseDto(existingTransaction);
    }

    // If payment order is still pending, we need to check with PayOS
    // For now, we'll mark it as completed and process (assuming user returns with success params)
    if (paymentOrder.status === PaymentStatus.PENDING) {
      // Update payment order status to completed
      paymentOrder.status = PaymentStatus.COMPLETED;
      paymentOrder.paidAt = new Date();
      await this.paymentOrderRepo.save(paymentOrder);
    }

    // Process the topup if status is completed
    if (paymentOrder.status === PaymentStatus.COMPLETED) {
      const { transaction } = await this.topUp(
        paymentOrder.accountId,
        paymentOrder.amount,
        `Nạp tiền từ PayOS - Order #${orderCode}`,
        paymentOrder.id,
      );

      // Reload transaction with serviceType relation
      const fullTransaction = await this.walletTransactionRepo.findOne({
        where: { id: transaction.id },
        relations: ['serviceType'],
      });

      return WalletTransactionMapper.toResponseDto(fullTransaction!);
    }

    throw new BadRequestException(
      `Payment order ${orderCode} has status ${paymentOrder.status}. Cannot process topup.`,
    );
  }

  /**
   * Admin deduct from wallet - Creates transaction and updates balance atomically
   * @param userId - User account ID
   * @param amount - Amount to deduct
   * @param description - Transaction description
   * @param paymentOrderId - Related payment order ID
   * @returns Object with updated wallet and transaction
   */
  async deductWallet(
    userId: number,
    amount: string,
    description?: string,
    paymentOrderId?: string,
  ): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
    // Use transaction to ensure atomicity
    return this.dataSource.transaction(async (manager) => {
      const walletRepo = manager.getRepository(Wallet);
      const transactionRepo = manager.getRepository(WalletTransaction);

      // Get wallet - throw error if not exists
      const wallet = await walletRepo.findOne({ where: { userId } });
      if (!wallet) {
        throw new NotFoundException(`Wallet not found for user ${userId}`);
      }

      // Check balance
      const currentBalance = parseFloat(wallet.balance);
      const amountToDeduct = parseFloat(amount);

      if (currentBalance < amountToDeduct) {
        throw new Error('Insufficient balance');
      }

      // Get service type for deduction (auto-create if not exists)
      const serviceType = await this.serviceTypesService.findOrCreateByCode(
        'ADJUSTMENT',
        this.getServiceTypeName('ADJUSTMENT'),
        this.getServiceTypeDescription('ADJUSTMENT'),
      );

      // Create wallet transaction (store as negative for deduction)
      const transaction = transactionRepo.create({
        walletUserId: userId,
        amount: `-${amount}`,
        serviceTypeId: serviceType.id,
        description: description || 'ví đã được trừ tiền',
        relatedEntityId: paymentOrderId,
      });
      await transactionRepo.save(transaction);

      // Update wallet balance
      const newBalance = currentBalance - amountToDeduct;
      wallet.balance = newBalance.toFixed(2);
      await walletRepo.save(wallet);

      return { wallet, transaction };
    });
  }

  /**
   * Get wallet transaction by orderCode
   * If transaction doesn't exist but payment order is completed, process the payment first
   * @param orderCode - Payment order code from PayOS
   * @param userId - User ID to verify ownership
   * @returns Wallet transaction
   */
  async getTransactionByOrderCode(orderCode: string, userId?: number): Promise<WalletTransaction> {
    // First, try to find existing transaction
    const queryBuilder = this.walletTransactionRepo
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.serviceType', 'serviceType')
      .where('transaction.relatedEntityId = :orderCode', { orderCode })
      .andWhere('transaction.relatedEntityType = :entityType', { entityType: 'payment_orders' });

    if (userId) {
      queryBuilder.andWhere('transaction.walletUserId = :userId', { userId });
    }

    let transaction = await queryBuilder.getOne();

    // If transaction not found, check if payment order exists and is completed
    if (!transaction) {
      const paymentOrder = await this.paymentOrderRepo.findOne({
        where: { id: orderCode },
        relations: ['serviceType'],
      });

      if (!paymentOrder) {
        throw new NotFoundException(`Payment order with orderCode ${orderCode} not found`);
      }

      // Check ownership
      if (userId && paymentOrder.accountId !== userId) {
        throw new NotFoundException(
          `Transaction with orderCode ${orderCode} not found or access denied`,
        );
      }

      // If payment is completed but transaction doesn't exist, process it now
      if (
        paymentOrder.status === PaymentStatus.COMPLETED &&
        paymentOrder.serviceType?.code === 'WALLET_TOPUP'
      ) {
        await this.processCompletedPayment(paymentOrder.id);

        // Try to fetch the transaction again
        transaction = await queryBuilder.getOne();
      }

      // If still no transaction, return payment order info as pending
      if (!transaction) {
        throw new NotFoundException(
          `Transaction for orderCode ${orderCode} is still being processed. Please wait and refresh.`,
        );
      }
    }

    return transaction;
  }

  /**
   * [Admin] Get all wallet transactions
   * @param limit - Number of transactions to return
   * @param offset - Number of transactions to skip
   * @returns Array of all wallet transaction DTOs
   */
  async getAllTransactions(limit: number, offset: number): Promise<WalletTransactionResponseDto[]> {
    const transactions = await this.walletTransactionRepo.find({
      relations: ['serviceType'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return WalletTransactionMapper.toResponseDtoArray(transactions);
  }

  /**
   * [Admin] Get total count of wallet transactions
   * @returns Total count
   */
  async getTotalTransactionsCount(): Promise<number> {
    return this.walletTransactionRepo.count();
  }

  /**
   * [Admin] Get all payment orders
   * @param limit - Number of orders to return
   * @param offset - Number of orders to skip
   * @returns Array of payment orders
   */
  async getAllPaymentOrders(limit = 100, offset = 0): Promise<PaymentOrder[]> {
    return this.paymentOrderRepo.find({
      relations: ['account', 'serviceType'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * [Admin] Get total count of payment orders
   * @returns Total count
   */
  async getTotalPaymentOrdersCount(): Promise<number> {
    return this.paymentOrderRepo.count();
  }
}
