import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { ServiceTypesService } from '../service-types/service-types.service';
import { PaymentOrder } from '../payos/entities/payment-order.entity';
import { PaymentStatus } from '../../shared/enums/payment-status.enum';
import { CreateTopupDto } from './dto/create-topup.dto';
import { CreatePayosDto } from '../payos/dto';

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
  private async updateWalletBalance(userId: number, amount: string): Promise<Wallet> {
    const wallet = await this.walletRepo.findOne({ where: { userId } });

    if (!wallet) {
      throw new NotFoundException(`Wallet not found for user ${userId}`);
    }

    const currentBalance = parseFloat(wallet.balance);
    const amountToAdd = parseFloat(amount);
    const newBalance = currentBalance + amountToAdd;

    if (newBalance < 0) {
      throw new Error('Insufficient balance');
    }

    wallet.balance = newBalance.toFixed(2);
    return this.walletRepo.save(wallet);
  }

  /**
   * Top up wallet - Creates transaction and updates balance atomically
   * @param userId - User account ID
   * @param amount - Amount to top up
   * @param description - Transaction description
   * @param paymentOrderId - Related payment order ID
   * @returns Object with updated wallet and transaction
   */
  async topUp(
    userId: number,
    amount: string,
    description?: string,
    paymentOrderId?: string,
  ): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
    // Use transaction to ensure atomicity
    return this.dataSource.transaction(async (manager) => {
      const walletRepo = manager.getRepository(Wallet);
      const transactionRepo = manager.getRepository(WalletTransaction);

      // Initialize wallet if not exists
      let wallet = await walletRepo.findOne({ where: { userId } });
      if (!wallet) {
        wallet = walletRepo.create({
          userId,
          balance: '0',
        });
        await walletRepo.save(wallet);
      }

      // Get service type for wallet topup
      const serviceType = await this.serviceTypesService.findByCode('WALLET_TOPUP');
      if (!serviceType) {
        throw new NotFoundException('WALLET_TOPUP service type not found');
      }

      // Create wallet transaction
      const transaction = transactionRepo.create({
        walletUserId: userId,
        amount,
        serviceTypeId: serviceType.id,
        description: description || 'Nạp tiền vào ví',
        relatedEntityId: paymentOrderId,
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
   * @param relatedEntityId - Related entity ID
   * @returns Object with updated wallet and transaction
   */
  async deduct(
    userId: number,
    amount: string,
    serviceTypeCode: string,
    description?: string,
    relatedEntityId?: string,
  ): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
    // Use transaction to ensure atomicity
    return this.dataSource.transaction(async (manager) => {
      const walletRepo = manager.getRepository(Wallet);
      const transactionRepo = manager.getRepository(WalletTransaction);

      // Get wallet
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

      // Get service type
      const serviceType = await this.serviceTypesService.findByCode(serviceTypeCode);
      if (!serviceType) {
        throw new NotFoundException(`Service type with code '${serviceTypeCode}' not found`);
      }

      // Create wallet transaction (store as negative for debit)
      const transaction = transactionRepo.create({
        walletUserId: userId,
        amount: `-${amount}`,
        serviceTypeId: serviceType.id,
        description,
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
   * Get wallet transactions for a user
   * @param userId - User account ID
   * @param limit - Number of transactions to return
   * @param offset - Number of transactions to skip
   * @returns Array of wallet transactions
   */
  async getTransactions(userId: number, limit = 20, offset = 0): Promise<WalletTransaction[]> {
    return this.walletTransactionRepo.find({
      where: { walletUserId: userId },
      relations: ['serviceType'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
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
    // Get WALLET_TOPUP service type
    const serviceType = await this.serviceTypesService.findByCode('WALLET_TOPUP');
    if (!serviceType) {
      throw new NotFoundException('WALLET_TOPUP service type not found');
    }

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
}
