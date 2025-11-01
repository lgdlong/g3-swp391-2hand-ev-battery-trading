import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { PaymentOrder } from '../payos/entities/payment-order.entity';
import { Post } from '../posts/entities/post.entity';
import { RefundsService } from './refunds.service';
import { PaymentStatus } from '../../shared/enums/payment-status.enum';
import { PostStatus } from '../../shared/enums/post.enum';
import { RefundScenario } from '../../shared/enums/refund-scenario.enum';

/**
 * Cron Job Service để tự động xử lý refund cho các post hết hạn
 * Chạy mỗi ngày lúc 00:00 (12h đêm)
 */
@Injectable()
export class RefundsCronService {
  private readonly logger = new Logger(RefundsCronService.name);

  constructor(
    @InjectRepository(PaymentOrder)
    private readonly paymentOrderRepo: Repository<PaymentOrder>,

    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,

    private readonly refundsService: RefundsService,
  ) {}

  /**
   * Cron job chạy mỗi ngày lúc 00:00 (12h đêm)
   * Quét và refund các post hết hạn
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'auto-refund-expired-posts',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleExpiredPostsRefund() {
    this.logger.log('🔄 [CRON] Starting auto refund for expired posts...');

    try {
      // 1️⃣ Tìm tất cả posts đã hết hạn và chưa được refund
      const expiredPosts = await this.findExpiredPostsNeedingRefund();

      this.logger.log(`📋 Found ${expiredPosts.length} expired posts needing refund`);

      if (expiredPosts.length === 0) {
        this.logger.log('✅ No expired posts to process');
        return;
      }

      // 2️⃣ Xử lý refund cho từng post
      let successCount = 0;
      let failCount = 0;

      for (const post of expiredPosts) {
        try {
          await this.processRefundForExpiredPost(post);
          successCount++;
          this.logger.log(`✅ Refunded post ${post.id}: ${post.title}`);
        } catch (error) {
          failCount++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const errorStack = error instanceof Error ? error.stack : undefined;
          this.logger.error(
            `❌ Failed to refund post ${post.id}: ${errorMessage}`,
            errorStack,
          );
        }
      }

      this.logger.log(
        `🎯 [CRON] Completed: ${successCount} success, ${failCount} failed`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `💥 [CRON] Critical error in auto refund job: ${errorMessage}`,
        errorStack,
      );
    }
  }

  /**
   * Tìm các posts đã hết hạn và cần refund
   * Điều kiện:
   * - Post có createdAt > 30 days (giả sử post hết hạn sau 30 ngày)
   * - Post status = PUBLISHED (đang hiển thị)
   * - Có payment order với status = COMPLETED
   * - Chưa có refund record cho payment order đó
   * 
   * TODO: Thay thế logic này bằng field expiresAt nếu Post entity có field đó
   */
  private async findExpiredPostsNeedingRefund(): Promise<Post[]> {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); // Posts cũ hơn 30 ngày

    // Subquery để tìm payment orders đã có refund
    const refundedPaymentIds = await this.paymentOrderRepo
      .createQueryBuilder('po')
      .leftJoin('refunds', 'r', 'r.payment_order_id = po.id')
      .where('r.id IS NOT NULL')
      .select('po.id')
      .getRawMany()
      .then((results) => results.map((r) => r.id));

    // Tìm posts hết hạn (created > 30 days ago)
    const queryBuilder = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.seller', 'seller')
      .innerJoin(
        PaymentOrder,
        'payment',
        'payment.payable_id = post.id AND payment.payable_type = :payableType',
        { payableType: 'POST' },
      )
      .where('post.created_at < :thirtyDaysAgo', { thirtyDaysAgo })
      .andWhere('post.status = :status', { status: PostStatus.PUBLISHED })
      .andWhere('payment.status = :paymentStatus', {
        paymentStatus: PaymentStatus.COMPLETED,
      });

    // Loại trừ các payment đã có refund
    if (refundedPaymentIds.length > 0) {
      queryBuilder.andWhere('payment.id NOT IN (:...refundedIds)', {
        refundedIds: refundedPaymentIds,
      });
    }

    return queryBuilder.getMany();
  }

  /**
   * Xử lý refund cho 1 post hết hạn
   */
  private async processRefundForExpiredPost(post: Post): Promise<void> {
    // Tìm payment order của post
    const paymentOrder = await this.paymentOrderRepo.findOne({
      where: {
        payableId: String(post.id),
        payableType: 'POST',
        status: PaymentStatus.COMPLETED,
      },
    });

    if (!paymentOrder) {
      throw new Error(`Payment order not found for post ${post.id}`);
    }

    // Gọi refund service với scenario EXPIRED (80% refund)
    const refundResult = await this.refundsService.handleRefund(
      {
        paymentOrderId: Number(paymentOrder.id),
        scenario: RefundScenario.EXPIRED,
        reason: `Auto refund: Post expired (created at ${post.createdAt.toISOString()})`,
        dryRun: false,
      },
      {
        sub: 0, // System user
        email: 'system@auto-refund',
        role: 'ADMIN',
      },
    );

    this.logger.debug(
      `Refund result for post ${post.id}:`,
      JSON.stringify(refundResult),
    );

    // Optional: Cập nhật post status thành EXPIRED nếu cần
    // post.status = PostStatus.EXPIRED;
    // await this.postRepo.save(post);
  }

  /**
   * Manual trigger để test (có thể gọi từ API endpoint)
   */
  async triggerManualRefundCheck(): Promise<{
    processed: number;
    success: number;
    failed: number;
  }> {
    this.logger.log('🔧 [MANUAL] Triggering manual refund check...');

    const expiredPosts = await this.findExpiredPostsNeedingRefund();
    let successCount = 0;
    let failCount = 0;

    for (const post of expiredPosts) {
      try {
        await this.processRefundForExpiredPost(post);
        successCount++;
      } catch (error) {
        failCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to refund post ${post.id}: ${errorMessage}`);
      }
    }

    return {
      processed: expiredPosts.length,
      success: successCount,
      failed: failCount,
    };
  }
}
