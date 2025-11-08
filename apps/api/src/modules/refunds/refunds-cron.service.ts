import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Post } from '../posts/entities/post.entity';
import { RefundPolicyService } from '../settings/service/refund-policy.service';
import { PostLifecycleService } from '../settings/service/post-lifecycle.service';
import { WalletsService } from '../wallets/wallets.service';
import { RefundScenario } from '../../shared/enums/refund-scenario.enum';
import { RefundsService } from './refunds.service';
import {
  RefundPolicyConfig,
  DEFAULT_REFUND_POLICY,
  calculateDaysSinceReviewed,
  getRefundScenarioAndRate,
} from './helper';

/**
 * Cron Job Service để tự động xử lý refund cho các post hết hạn
 * Chạy mỗi ngày lúc 00:00 (12h đêm)
 */
@Injectable()
export class RefundsCronService {
  private readonly logger = new Logger(RefundsCronService.name);

  constructor(
    @Inject(forwardRef(() => RefundsService))
    private readonly refundsService: RefundsService,
    private readonly refundPolicyService: RefundPolicyService,
    private readonly postLifecycleService: PostLifecycleService,
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
      const candidatePosts = await this.refundsService.findRefundCandidatePosts();

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
   * Lấy RefundPolicy hiện tại từ database qua service
   * RefundPolicy luôn chỉ có 1 dòng duy nhất
   * Nếu không có, trả về giá trị mặc định
   */
  private async getRefundPolicy(): Promise<RefundPolicyConfig> {
    try {
      // RefundPolicy luôn có ID = 1 (singleton record)
      const policy = await this.refundPolicyService.findOne(1);

      return {
        cancelEarlyRate: policy.cancelEarlyRate ?? 1.0,
        cancelLateRate: policy.cancelLateRate ?? 0.7,
        expiredRate: policy.expiredRate ?? 0.5,
        fraudSuspectedRate: policy.fraudSuspectedRate ?? 0.0,
        cancelEarlyDaysThreshold: policy.cancelEarlyDaysThreshold ?? 7,
        cancelLateDaysThreshold: policy.cancelLateDaysThreshold ?? 7,
      };
    } catch {
      this.logger.warn('⚠️ No RefundPolicy found in database, using default values');
      return DEFAULT_REFUND_POLICY;
    }
  }

  /**
   * Thực hiện hoàn tiền vào ví user và cập nhật trạng thái refund
   *
   * @param refundId - ID của refund record
   * @param postId - ID của post
   * @param accountId - ID của account nhận tiền
   * @param amountRefund - Số tiền hoàn
   * @param scenario - Scenario refund
   * @param refundPercent - Tỷ lệ refund
   */
  private async executeRefundToWallet(
    refundId: string,
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
      await this.refundsService.updateRefundAsRefunded(refundId, tx.transaction.id);

      this.logger.log(
        `✅ Refunded ${amountRefund} VND (${refundPercent}%) to user ${accountId} for post ${postId}`,
      );
    } catch (error) {
      // Cập nhật trạng thái thất bại
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.refundsService.updateRefundAsFailed(refundId, errorMessage);

      this.logger.error(`❌ Failed to refund post ${postId}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Xử lý refund cho 1 post ứng cử
   *
   * Flow xử lý:
   * 1. Lấy RefundPolicy từ database
   * 2. Tìm payment record
   * 3. Tính số ngày từ khi post được duyệt
   * 4. Xác định scenario và rate (nếu không đủ điều kiện thì bỏ qua)
   * 5. Tính số tiền refund
   * 6. Tạo refund record
   * 7. Thực hiện refund vào wallet
   *
   * @param post - Post cần xử lý refund
   */
  private async processRefundForCandidatePost(post: Post): Promise<void> {
    // Lấy RefundPolicy từ database
    const policy = await this.getRefundPolicy();

    // Lấy expirationDays từ PostLifecycle
    const postLifecycle = await this.postLifecycleService.findOne(1);
    const expirationDays = postLifecycle.expirationDays ?? 30;

    // Guard: Kiểm tra payment record
    const postPayment = await this.refundsService.findPostPaymentByPostId(post.id);
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
    const daysSinceReviewed = calculateDaysSinceReviewed(new Date(post.reviewedAt!));

    // Guard: Xác định scenario và rate
    const refundInfo = getRefundScenarioAndRate(post, daysSinceReviewed, policy, expirationDays);
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
    const refund = await this.refundsService.createRefundRecord({
      postId: post.id,
      accountId: postPayment.accountId,
      scenario,
      refundPercent,
      amountOriginal: postPayment.amountPaid,
      amountRefund: String(amountRefund),
    });

    // Thực hiện refund vào wallet
    await this.executeRefundToWallet(
      refund.id,
      post.id,
      postPayment.accountId,
      amountRefund,
      scenario,
      refundPercent,
    );
  }

  /**
   * Lấy danh sách posts đang chờ hoàn tiền (đủ điều kiện nhưng chưa được cron job xử lý)
   *
   * @returns Danh sách posts ứng cử cho refund
   */
  async getRefundCandidatePosts(): Promise<Post[]> {
    return await this.refundsService.findRefundCandidatePosts();
  }

  /**
   * Xử lý refund thủ công cho một post cụ thể
   *
   * @param postId - ID của post cần refund
   * @returns Kết quả xử lý refund
   */
  async processManualRefundForPost(postId: string): Promise<{
    success: boolean;
    message: string;
    refund?: any;
  }> {
    try {
      // Tìm post
      const post = await this.refundsService.findPostById(postId);

      if (!post) {
        return {
          success: false,
          message: `Post ${postId} not found`,
        };
      }

      // Kiểm tra xem post đã có refund chưa
      const hasRefund = await this.refundsService.hasRefundByPostId(postId);

      if (hasRefund) {
        return {
          success: false,
          message: `Post ${postId} already has a refund record`,
        };
      }

      // Xử lý refund
      await this.processRefundForCandidatePost(post);

      return {
        success: true,
        message: `Successfully processed refund for post ${postId}`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to manually refund post ${postId}: ${errorMessage}`);

      return {
        success: false,
        message: `Failed to refund post ${postId}: ${errorMessage}`,
      };
    }
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

    const candidatePosts = await this.refundsService.findRefundCandidatePosts();
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
