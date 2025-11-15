import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Post } from '../posts/entities/post.entity';
import { PostPayment } from './entities/post-payment.entity';
import { CreatePostPaymentDto } from './dto/create-post-payment.dto';
import { PostPaymentResponseDto } from './dto/post-payment-response.dto';
import { WalletsService } from '../wallets/wallets.service';
import { FeeTierService } from '../settings/service/fee-tier.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
    @InjectRepository(PostPayment)
    private readonly postPaymentRepository: Repository<PostPayment>,
    private readonly walletsService: WalletsService,
    private readonly feeTierService: FeeTierService,
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * Create a new post payment record
   */
  async createPostPayment(
    createPostPaymentDto: CreatePostPaymentDto,
  ): Promise<PostPaymentResponseDto> {
    const postPayment = this.postPaymentRepository.create(createPostPaymentDto);
    const savedPayment = await this.postPaymentRepository.save(postPayment);
    return this.mapToResponseDto(savedPayment);
  }

  /**
   * Process post payment with wallet deduction and create payment record
   * This method ensures both wallet deduction and post payment creation happen together
   * @param userId - User ID
   * @param postId - Post ID
   * @param priceVnd - Post price in VND for fee calculation
   * @returns Combined wallet transaction and post payment information
   */
  async processPostPayment(
    userId: number,
    postId: string,
    priceVnd: number,
  ): Promise<{ wallet: any; transaction: any; postPayment: PostPaymentResponseDto }> {
    // Check if post has already been paid for
    const existingPayment = await this.isPostPaid(postId);
    if (existingPayment) {
      throw new BadRequestException('Bài đăng này đã được thanh toán rồi');
    }

    // Find applicable fee tier
    const feeTiers = await this.feeTierService.findAll();
    const applicableTier = feeTiers.find((tier) => {
      const minPrice = tier.minPrice;
      const maxPrice = tier.maxPrice;
      return priceVnd >= minPrice && (maxPrice === null || priceVnd <= maxPrice);
    });

    if (!applicableTier) {
      throw new BadRequestException('Không tìm thấy bậc phí phù hợp với giá bài đăng');
    }

    // Calculate deposit amount
    const depositRate = applicableTier.depositRate;
    const depositAmount = Math.round(priceVnd * depositRate);

    // Execute wallet deduction and post payment creation in sequence
    // Note: WalletsService.deduct already uses a transaction internally
    const walletResult = await this.walletsService.deduct(
      userId,
      depositAmount.toString(),
      'POST_PAYMENT',
      `Phí đặt cọc đăng bài #${postId}`,
      'posts',
      postId,
    );

    // Create post payment record linked to the wallet transaction
    const postPayment = await this.createPostPayment({
      postId,
      accountId: userId,
      amountPaid: depositAmount.toString(),
      walletTransactionId: walletResult.transaction.id,
    });

    return {
      wallet: walletResult.wallet,
      transaction: walletResult.transaction,
      postPayment,
    };
  }

  /**
   * Get post payment by post ID
   */
  async getPostPaymentByPostId(postId: string): Promise<PostPaymentResponseDto> {
    const postPayment = await this.postPaymentRepository.findOne({
      where: { postId },
      relations: ['account', 'walletTransaction'],
    });

    if (!postPayment) {
      throw new NotFoundException(`Post payment not found for post ID: ${postId}`);
    }

    return this.mapToResponseDto(postPayment);
  }

  /**
   * Get all post payments by account ID
   */
  async getPostPaymentsByAccountId(accountId: number): Promise<PostPaymentResponseDto[]> {
    const postPayments = await this.postPaymentRepository.find({
      where: { accountId },
      relations: ['account', 'walletTransaction'],
      order: { createdAt: 'DESC' },
    });

    return postPayments.map((payment) => this.mapToResponseDto(payment));
  }

  /**
   * Get all post payments with pagination
   */
  async getAllPostPayments(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: PostPaymentResponseDto[]; total: number; page: number; limit: number }> {
    const [postPayments, total] = await this.postPaymentRepository.findAndCount({
      relations: ['account', 'walletTransaction'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: postPayments.map((payment) => this.mapToResponseDto(payment)),
      total,
      page,
      limit,
    };
  }

  /**
   * Check if post has been paid for
   */
  async isPostPaid(postId: string): Promise<boolean> {
    const postPayment = await this.postPaymentRepository.findOne({
      where: { postId },
    });

    return !!postPayment;
  }

  /**
   * Delete post payment (should be used with caution)
   */
  async deletePostPayment(postId: string): Promise<void> {
    const result = await this.postPaymentRepository.delete({ postId });

    if (result.affected === 0) {
      throw new NotFoundException(`Post payment not found for post ID: ${postId}`);
    }
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(postPayment: PostPayment): PostPaymentResponseDto {
    return {
      postId: postPayment.postId,
      accountId: postPayment.accountId,
      amountPaid: postPayment.amountPaid,
      walletTransactionId: postPayment.walletTransactionId,
      createdAt: postPayment.createdAt,
    };
  }

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
    const existingPayment = await this.postPaymentRepository.findOne({
      where: { postId },
    });

    if (existingPayment) {
      throw new ConflictException(`Post ${postId} already has a deposit payment record`);
    }

    // Create new payment record
    const postPayment = this.postPaymentRepository.create({
      postId,
      accountId,
      amountPaid,
      walletTransactionId,
    });

    return await this.postPaymentRepository.save(postPayment);
  }

  /**
   * Get post deposit payment by post ID
   * @param postId - Post ID
   * @returns Post payment record or null
   */
  async getPostDepositPayment(postId: string): Promise<PostPayment | null> {
    return await this.postPaymentRepository.findOne({
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
    const payment = await this.postPaymentRepository.findOne({
      where: { postId },
    });
    return !!payment;
  }
}
