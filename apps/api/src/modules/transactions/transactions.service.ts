import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostPayment } from './entities/post-payment.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(PostPayment)
    private readonly postPaymentRepo: Repository<PostPayment>,
  ) {}

  /**
   * Record post deposit payment when user pays coin to create post
   * @param postId - Post ID
   * @param accountId - User account ID who paid deposit
   * @param amountPaid - Deposit amount paid
   * @param walletTransactionId - Related wallet transaction ID
   * @returns Created post payment record
   */
  async recordPostDepositPayment(
    postId: string,
    accountId: number,
    amountPaid: string,
    walletTransactionId: number,
  ): Promise<PostPayment> {
    // Check if payment already exists for this post
    const existingPayment = await this.postPaymentRepo.findOne({
      where: { postId },
    });

    if (existingPayment) {
      throw new ConflictException(`Post ${postId} already has a deposit payment record`);
    }

    // Create new payment record
    const postPayment = this.postPaymentRepo.create({
      postId,
      accountId,
      amountPaid,
      walletTransactionId,
    });

    return await this.postPaymentRepo.save(postPayment);
  }

  /**
   * Get post deposit payment by post ID
   * @param postId - Post ID
   * @returns Post payment record or null
   */
  async getPostDepositPayment(postId: string): Promise<PostPayment | null> {
    return await this.postPaymentRepo.findOne({
      where: { postId },
      relations: ['account', 'walletTransaction'],
    });
  }

  /**
   * Check if post has deposit payment
   * @param postId - Post ID
   * @returns True if deposit paid, false otherwise
   */
  async hasDepositPayment(postId: string): Promise<boolean> {
    const payment = await this.postPaymentRepo.findOne({
      where: { postId },
    });
    return !!payment;
  }
}
