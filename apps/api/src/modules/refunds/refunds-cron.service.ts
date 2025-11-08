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
  async handleExpiredPostsRefund(): Promise<void> {
    this.logger.log('[CRON] Starting auto refund for expired posts...');

    try {
      // 1️⃣ Tìm tất cả posts ứng cử để kiểm tra refund
      const candidatePosts = await this.findRefundCandidatePosts();

      this.logger.log(`Found ${candidatePosts.length} candidate posts for refund check`);

      if (candidatePosts.length === 0) {
        this.logger.log('No posts to process');
        return;
      }

      // 2️⃣ Xử lý refund cho từng post
      let successCount = 0;
      let failCount = 0;

      for (const post of candidatePosts) {
        try {
          await this.processRefundForCandidatePost(post);
          successCount++;
          this.logger.log(`Refunded post ${post.id}: ${post.title}`);
        } catch (error) {
          failCount++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const errorStack = error instanceof Error ? error.stack : undefined;
          this.logger.error(`Failed to refund post ${post.id}: ${errorMessage}`, errorStack);
        }
      }

      this.logger.log(`🎯 [CRON] Completed: ${successCount} success, ${failCount} failed`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`💥 [CRON] Critical error in auto refund job: ${errorMessage}`, errorStack);
    }
  }

  /**
   * Xác định scenario và tỷ lệ refund dựa trên status và số ngày
   *
   * @param post - Post cần kiểm tra
   * @param daysSinceReviewed - Số ngày từ khi post được duyệt
   * @returns Object chứa scenario và rate, hoặc null nếu không đủ điều kiện refund
   */
  private getRefundScenarioAndRate(
    post: Post,
    daysSinceReviewed: number,
  ): { scenario: RefundScenario; rate: number } | null {
    // Post đã bị user hủy (ARCHIVED)
    if (post.status === PostStatus.ARCHIVED) {
      if (daysSinceReviewed < 7) {
        // Hủy sớm < 7 ngày: 100%
        return { scenario: RefundScenario.CANCEL_EARLY, rate: 1.0 };
      } else {
        // Hủy trễ >= 7 ngày: 70%
        return { scenario: RefundScenario.CANCEL_LATE, rate: 0.7 };
      }
    }

    // Post đang published
    if (post.status === PostStatus.PUBLISHED) {
      if (daysSinceReviewed >= 30) {
        // Hết hạn > 30 ngày: 50%
        return { scenario: RefundScenario.EXPIRED, rate: 0.5 };
      } else {
        // Chưa hết hạn, không refund
        this.logger.debug(
          `⏳ Post ${post.id} is PUBLISHED but not expired yet (${daysSinceReviewed} days), skipping`,
        );
        return null;
      }
    }

    // Status không hợp lệ
    this.logger.warn(`⚠️ Post ${post.id} has invalid status ${post.status}, skipping`);
    return null;
  }

  /**
   * Tính số ngày từ khi post được duyệt đến hiện tại
   *
   * @param reviewedAt - Thời điểm post được duyệt
   * @returns Số ngày đã trôi qua
   */
  private calculateDaysSinceReviewed(reviewedAt: Date): number {
    const now = new Date();
    return Math.floor((now.getTime() - reviewedAt.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Tìm các posts ứng cử để kiểm tra refund
   *
   * Hàm này trả về tất cả posts có khả năng được refund, chưa kiểm tra điều kiện chi tiết.
   * Việc kiểm tra điều kiện cụ thể (số ngày, status) sẽ được thực hiện trong processRefundForCandidatePost.
   *
   * Điều kiện lọc:
   * - Post có reviewedAt (đã được duyệt)
   * - Post status = PUBLISHED (có thể hết hạn) hoặc ARCHIVED (user đã hủy)
   * - Chưa được refund (kiểm tra trong bảng refunds)
   *
   * @returns Danh sách posts ứng cử để kiểm tra refund
   */
  private async findRefundCandidatePosts(): Promise<Post[]> {
    const posts = await this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.seller', 'seller')
      .leftJoin('refunds', 'refund', 'refund.post_id = post.id')
      .where('post.reviewedAt IS NOT NULL')
      .andWhere('post.status IN (:...statuses)', {
        statuses: [PostStatus.PUBLISHED, PostStatus.ARCHIVED],
      })
      .andWhere('refund.id IS NULL')
      .getMany();

    return posts;
  }

  /**
   * Tìm payment record của post
   *
   * @param postId - ID của post
   * @returns PostPayment record hoặc null nếu không tìm thấy
   */
  private async findPostPayment(postId: string): Promise<PostPayment | null> {
    return await this.postPaymentRepo.findOne({
      where: { postId },
      relations: ['account'],
    });
  }

  /**
   * Tạo refund record với status PENDING
   *
   * @param params - Thông tin để tạo refund
   * @returns Refund record đã được lưu
   */
  private async createRefundRecord(params: {
    postId: string;
    accountId: number;
    scenario: RefundScenario;
    refundPercent: number;
    amountOriginal: string;
    amountRefund: string;
  }): Promise<Refund> {
    const refund = this.refundRepo.create({
      postId: params.postId,
      accountId: params.accountId,
      scenario: params.scenario,
      policyRatePercent: params.refundPercent,
      amountOriginal: params.amountOriginal,
      amountRefund: params.amountRefund,
      status: RefundStatus.PENDING,
      reason: `Auto refund - ${params.scenario}`,
    });

    return await this.refundRepo.save(refund);
  }

  /**
   * Thực hiện hoàn tiền vào ví user và cập nhật trạng thái refund
   *
   * @param refund - Refund record cần xử lý
   * @param postId - ID của post
   * @param accountId - ID của account nhận tiền
   * @param amountRefund - Số tiền hoàn
   * @param scenario - Scenario refund
   * @param refundPercent - Tỷ lệ refund
   */
  private async executeRefundToWallet(
    refund: Refund,
    postId: string,
    accountId: number,
    amountRefund: number,
    scenario: RefundScenario,
    refundPercent: number,
  ): Promise<void> {
    try {
      // Hoàn tiền vào wallet
      const tx = await this.walletsService.refund(
        accountId,
        String(amountRefund),
        `Hoàn tiền phí đăng bài #${postId} - ${scenario} - ${refundPercent}%`,
        `REFUND-POST-${postId}-${Date.now()}`,
      );

      // Cập nhật trạng thái thành công
      refund.status = RefundStatus.REFUNDED;
      refund.walletTransactionId = tx.transaction.id;
      refund.refundedAt = new Date();
      await this.refundRepo.save(refund);

      this.logger.log(
        `✅ Refunded ${amountRefund} VND (${refundPercent}%) to user ${accountId} for post ${postId}`,
      );
    } catch (error) {
      // Cập nhật trạng thái thất bại
      refund.status = RefundStatus.FAILED;
      refund.reason = `Auto refund failed: ${(error as Error).message}`;
      await this.refundRepo.save(refund);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Failed to refund post ${postId}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Xử lý refund cho 1 post ứng cử
   *
   * Flow xử lý:
   * 1. Tìm payment record
   * 2. Tính số ngày từ khi post được duyệt
   * 3. Xác định scenario và rate (nếu không đủ điều kiện thì bỏ qua)
   * 4. Tính số tiền refund
   * 5. Tạo refund record
   * 6. Thực hiện refund vào wallet
   *
   * @param post - Post cần xử lý refund
   */
  private async processRefundForCandidatePost(post: Post): Promise<void> {
    // Guard: Kiểm tra payment record
    const postPayment = await this.findPostPayment(post.id);
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
    const daysSinceReviewed = this.calculateDaysSinceReviewed(new Date(post.reviewedAt!));

    // Guard: Xác định scenario và rate
    const refundInfo = this.getRefundScenarioAndRate(post, daysSinceReviewed);
    if (!refundInfo) {
      return; // Post không đủ điều kiện refund
    }

    const { scenario, rate } = refundInfo;

    const amountPaid = Number.parseFloat(postPayment.amountPaid); // số tiền đã thanh toán
    const amountRefund = Math.floor(amountPaid * rate); // số tiền sẽ được hoàn lại
    const refundPercent = Math.floor(rate * 100); // phần trăm hoàn tiền

    this.logger.log(
      `Processing refund for post ${post.id}: ${post.status}, ${daysSinceReviewed} days → ${scenario} (${refundPercent}%)`,
    );
    this.logger.log(
      `Amount paid: ${amountPaid} VND → Refund: ${amountRefund} VND (${refundPercent}%)`,
    );

    // Tạo refund record
    const refund = await this.createRefundRecord({
      postId: post.id,
      accountId: postPayment.accountId,
      scenario,
      refundPercent,
      amountOriginal: postPayment.amountPaid,
      amountRefund: String(amountRefund),
    });

    // Thực hiện refund vào wallet
    await this.executeRefundToWallet(
      refund,
      post.id,
      postPayment.accountId,
      amountRefund,
      scenario,
      refundPercent,
    );
  }

  /**
   * Manual trigger để test cron job (có thể gọi từ API endpoint)
   *
   * Hàm này cho phép admin trigger refund check thủ công để test hoặc xử lý khẩn cấp.
   *
   * @returns Kết quả xử lý bao gồm số lượng posts đã xử lý, thành công và thất bại
   */
  async triggerManualRefundCheck(): Promise<{
    processed: number;
    success: number;
    failed: number;
  }> {
    this.logger.log('🔧 [MANUAL] Triggering manual refund check...');

    const candidatePosts = await this.findRefundCandidatePosts();
    let successCount = 0;
    let failCount = 0;

    for (const post of candidatePosts) {
      try {
        await this.processRefundForCandidatePost(post);
        successCount++;
      } catch (error) {
        failCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to refund post ${post.id}: ${errorMessage}`);
      }
    }

    return {
      processed: candidatePosts.length,
      success: successCount,
      failed: failCount,
    };
  }
}
