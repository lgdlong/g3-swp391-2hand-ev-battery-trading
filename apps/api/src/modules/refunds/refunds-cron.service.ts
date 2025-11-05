import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Post } from '../posts/entities/post.entity';
import { PostPayment } from '../transactions/entities/post-payment.entity';
import { Refund } from './entities/refund.entity';
import { WalletsService } from '../wallets/wallets.service';
import { PostStatus } from '../../shared/enums/post.enum';
import { RefundScenario } from '../../shared/enums/refund-scenario.enum';
import { RefundStatus } from '../../shared/enums/refund-status.enum';

/**
 * Cron Job Service để tự động xử lý refund cho các post hết hạn
 * Chạy mỗi ngày lúc 00:00 (12h đêm)
 */
@Injectable()
export class RefundsCronService {
  private readonly logger = new Logger(RefundsCronService.name);

  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,

    @InjectRepository(PostPayment)
    private readonly postPaymentRepo: Repository<PostPayment>,

    @InjectRepository(Refund)
    private readonly refundRepo: Repository<Refund>,

    private readonly walletsService: WalletsService,
  ) {}

  /**
   * Cron job chạy mỗi ngày lúc 00:00 (12h đêm)
   * Quét và refund các post hết hạn
   */
  @Cron(CronExpression.EVERY_MINUTE, {
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
   * Tìm các posts cần refund
   * Điều kiện:
   * - Post có reviewedAt (đã được duyệt)
   * - Post status = PUBLISHED (có thể hết hạn) hoặc ARCHIVED (user hủy)
   * - Chưa được refund (kiểm tra trong refunds table)
   * 
   * Logic refund:
   * - ARCHIVED + < 7 ngày: 100% (hủy sớm)
   * - ARCHIVED + 7-30 ngày: 70% (hủy trễ)
   * - PUBLISHED + > 30 ngày: 50% (hết hạn tự động)
   * - FRAUD: 0% (admin reject)
   */
  private async findExpiredPostsNeedingRefund(): Promise<Post[]> {
    // Tìm tất cả posts đã được duyệt và có status PUBLISHED hoặc ARCHIVED
    const posts = await this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.seller', 'seller')
      .leftJoin('refunds', 'refund', 'refund.post_id = post.id')
      .where('post.reviewedAt IS NOT NULL') // Chỉ lấy posts đã được duyệt
      .andWhere('post.status IN (:...statuses)', { 
        statuses: [PostStatus.PUBLISHED, PostStatus.ARCHIVED]
      })
      .andWhere('refund.id IS NULL') // Chưa có refund record
      .getMany();

    return posts;
  }

  /**
   * Xử lý refund cho 1 post
   * Logic dựa vào post_payments:
   *   - Tìm payment record trong post_payments với post_id
   *   - Lấy amount_paid và account_id
   *   
   * Refund rate (NEW LOGIC):
   *   - Hủy sớm (< 7 ngày): 100%
   *   - Hủy trễ (7-30 ngày): 70%
   *   - Hết hạn (> 30 ngày): 50%
   *   - Gian lận: 0% (admin reject)
   */
  private async processRefundForExpiredPost(post: Post): Promise<void> {
    // Tìm payment record trong post_payments
    const postPayment = await this.postPaymentRepo.findOne({
      where: {
        postId: post.id,
      },
      relations: ['account'],
    });

    if (!postPayment) {
      this.logger.warn(
        `⚠️ Post ${post.id} has no payment record in post_payments, skipping refund`,
      );
      return;
    }

    this.logger.log(
      `💰 Found payment: ${postPayment.amountPaid} VND for post ${post.id} by account ${postPayment.accountId}`,
    );

    // Tính số ngày từ khi post được duyệt
    const reviewedAt = new Date(post.reviewedAt!);
    const now = new Date();
    const daysSinceReviewed = Math.floor(
      (now.getTime() - reviewedAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Xác định tỷ lệ refund dựa trên status và số ngày
    let refundRate: number;
    let scenario: RefundScenario;

    if (post.status === PostStatus.ARCHIVED) {
      // User chủ động hủy (ARCHIVED)
      if (daysSinceReviewed < 7) {
        // Hủy sớm < 7 ngày: 100%
        refundRate = 1.0;
        scenario = RefundScenario.CANCEL_EARLY;
      } else {
        // Hủy trễ >= 7 ngày (chưa hết hạn): 70%
        refundRate = 0.7;
        scenario = RefundScenario.CANCEL_LATE;
      }
    } else if (post.status === PostStatus.PUBLISHED) {
      // Hết hạn tự động (PUBLISHED + > 30 ngày)
      if (daysSinceReviewed >= 30) {
        // Hết hạn > 30 ngày: 50%
        refundRate = 0.5;
        scenario = RefundScenario.EXPIRED;
      } else {
        // Chưa hết hạn, không refund
        this.logger.debug(
          `⏳ Post ${post.id} is PUBLISHED but not expired yet (${daysSinceReviewed} days), skipping`,
        );
        return;
      }
    } else {
      this.logger.warn(
        `⚠️ Post ${post.id} has invalid status ${post.status}, skipping`,
      );
      return;
    }

    // Tính số tiền refund từ post_payments.amount_paid
    const amountPaid = parseFloat(postPayment.amountPaid);
    const amountRefund = Math.floor(amountPaid * refundRate);
    const refundPercent = Math.floor(refundRate * 100);

    this.logger.log(
      `Processing refund for post ${post.id}: ${post.status}, ${daysSinceReviewed} days → ${scenario} (${refundPercent}%)`,
    );
    this.logger.log(
      `  Amount paid: ${amountPaid} VND → Refund: ${amountRefund} VND (${refundPercent}%)`,
    );

    // 1️⃣ Tạo Refund record (PENDING)
    const refund = this.refundRepo.create({
      postId: post.id,
      accountId: postPayment.accountId,
      scenario: scenario,
      policyRatePercent: refundPercent,
      amountOriginal: postPayment.amountPaid,
      amountRefund: String(amountRefund),
      status: RefundStatus.PENDING,
      reason: `Auto refund - ${scenario}`,
    });
    await this.refundRepo.save(refund);

    try {
      // 2️⃣ Refund vào wallet của user
      const tx = await this.walletsService.topUp(
        postPayment.accountId,
        String(amountRefund),
        `Hoàn tiền phí đăng bài #${post.id} - ${scenario} - ${refundPercent}%`,
        `REFUND-POST-${post.id}-${Date.now()}`,
      );

      // 3️⃣ Update refund status → REFUNDED
      refund.status = RefundStatus.REFUNDED;
      refund.walletTransactionId = tx.transaction.id;
      refund.refundedAt = new Date();
      await this.refundRepo.save(refund);

      this.logger.log(
        `✅ Refunded ${amountRefund} VND (${refundPercent}%) to user ${postPayment.accountId} for post ${post.id}`,
      );
    } catch (error) {
      // 4️⃣ Nếu lỗi → Update refund status → FAILED
      refund.status = RefundStatus.FAILED;
      refund.reason = `Auto refund failed: ${(error as Error).message}`;
      await this.refundRepo.save(refund);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Failed to refund post ${post.id}: ${errorMessage}`);
      throw error;
    }
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
