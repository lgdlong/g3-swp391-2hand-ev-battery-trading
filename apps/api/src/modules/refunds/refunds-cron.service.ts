import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Post } from '../posts/entities/post.entity';
import { RefundPolicyService } from '../settings/service/refund-policy.service';
import { PostLifecycleService } from '../settings/service/post-lifecycle.service';
import { WalletsService } from '../wallets/wallets.service';
import { RefundScenario } from '../../shared/enums/refund-scenario.enum';
import { RefundStatus } from '../../shared/enums/refund-status.enum';
import { RefundsService } from './refunds.service';
import { PostFraudFlagsService } from '../post-fraud-flags/post-fraud-flags.service';
import { FraudFlagStatus } from '../post-fraud-flags/entities/post-fraud-flag.entity';
import { ChatService } from '../chat/chat.service';
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
    private readonly postFraudFlagsService: PostFraudFlagsService,
    private readonly chatService: ChatService,
  ) {}

  /**
   * Cron job chạy mỗi ngày lúc 00:00 (12h đêm)
   * Quét và refund các post hết hạn
   */
  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
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

      // Cập nhật trạng thái thành công + auto-archive post
      await this.refundsService.updateRefundAsRefunded(refundId, tx.transaction.id, postId);

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
   * 3. 🔒 KIỂM TRA GIAN LẬN (ưu tiên cao nhất)
   * 4. 🔒 KIỂM TRA HOẠT ĐỘNG CHAT (chống bán chui)
   * 5. Tính số ngày từ khi post được duyệt
   * 6. Xác định scenario và rate (nếu không đủ điều kiện thì bỏ qua)
   * 7. Tính số tiền refund
   * 8. Tạo refund record với status PENDING
   * 9. (Không tự động hoàn tiền - chờ Admin duyệt)
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
      this.logger.debug(
        '[processRefundForCandidatePost] SKIPPING: No payment record found for this post',
      );
      return;
    }

    this.logger.log(
      `💰 Found payment: ${postPayment.amountPaid} VND for post ${post.id} by account ${postPayment.accountId}`,
    );

    // 🔒 1. KIỂM TRA GIAN LẬN (ƯU TIÊN CAO NHẤT)
    const fraudFlag = await this.postFraudFlagsService.getFlagByPostId(post.id);
    if (fraudFlag) {
      const amountPaid = Number.parseFloat(postPayment.amountPaid);
      const rate = policy.fraudSuspectedRate ?? 0.0;
      const amountRefund = Math.floor(amountPaid * rate);
      const refundPercent = Math.floor(rate * 100);

      // Case 1: CONFIRMED fraud → REJECTED ngay (Kịch bản #2)
      if (fraudFlag.status === FraudFlagStatus.CONFIRMED) {
        this.logger.warn(
          `🚫 Post ${post.id} is CONFIRMED fraud. Creating REJECTED refund (0% refund, 100% fee captured).`,
        );

        await this.refundsService.createRefundRecord({
          postId: post.id,
          accountId: postPayment.accountId,
          scenario: RefundScenario.FRAUD_CONFIRMED,
          refundPercent: 0,
          amountOriginal: postPayment.amountPaid,
          amountRefund: '0',
          status: RefundStatus.REJECTED,
          reason: `[TỰ ĐỘNG] Gian lận được XÁC NHẬN bởi admin. Không được phép hoàn tiền. Tiền phí đã bị tịch thu.`,
        });

        this.logger.log(`✅ Created REJECTED refund for confirmed fraud post ${post.id}`);
        return;
      }

      // Case 2: SUSPECTED fraud → PENDING cho admin duyệt (Kịch bản #3)
      if (fraudFlag.status === FraudFlagStatus.SUSPECTED) {
        this.logger.warn(
          `⚠️ Post ${post.id} is SUSPECTED fraud. Creating PENDING refund for admin review.`,
        );

        await this.refundsService.createRefundRecord({
          postId: post.id,
          accountId: postPayment.accountId,
          scenario: RefundScenario.FRAUD_SUSPECTED,
          refundPercent,
          amountOriginal: postPayment.amountPaid,
          amountRefund: String(amountRefund),
          status: RefundStatus.PENDING,
          reason: `[TỰ ĐỘNG] Nghi ngờ gian lận. Chờ quyết định của admin (mặc định: ${refundPercent}% = ${amountRefund} VND).`,
        });

        this.logger.log(
          `✅ Created PENDING refund for suspected fraud post ${post.id} (${refundPercent}%)`,
        );
        return;
      }
    }

    // 🔒 2. KIỂM TRA HOẠT ĐỘNG CHAT (CHỐNG BÁN CHUI)
    const hasChatActivity = await this.chatService.hasPostChatActivity(post.id);
    let chatCount = 0;

    if (hasChatActivity) {
      chatCount = await this.chatService.getPostChatActivityCount(post.id);
      this.logger.log(
        `💬 Post ${post.id} has chat activity (${chatCount} conversation(s)) - will apply anti-fraud logic`,
      );
    }

    // Tính số ngày từ khi post được duyệt
    const daysSinceReviewed = calculateDaysSinceReviewed(new Date(post.reviewedAt!));

    // Guard: Xác định scenario và rate (ĐÃ BAO GỒM CHAT)
    const refundInfo = getRefundScenarioAndRate(
      post,
      daysSinceReviewed,
      policy,
      expirationDays,
      hasChatActivity,
    );
    if (!refundInfo) {
      this.logger.warn(`⚠️ Post ${post.id} does not meet refund criteria, skipping refund`);
      this.logger.debug(
        '[processRefundForCandidatePost] SKIPPING: Post does not meet refund eligibility criteria',
      );
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
    if (amountRefund <= 0) {
      this.logger.warn(`⚠️ Calculated refund amount is 0 for post ${post.id}, skipping refund`);
      this.logger.debug(
        '[processRefundForCandidatePost] SKIPPING: Calculated refund amount is zero or negative',
      );
      return;
    }

    // 🔄 Quyết định tự động hoàn tiền hay chờ Admin duyệt
    // - Tự động hoàn tiền: Trường hợp bình thường (KHÔNG có chat activity nghi ngờ bán chui)
    // - Chờ Admin duyệt: Có chat activity (nghi ngờ bán chui) → cần kiểm tra thủ công
    const shouldAutoRefund = !hasChatActivity;

    if (shouldAutoRefund) {
      // ✅ TỰ ĐỘNG HOÀN TIỀN - Trường hợp bình thường
      this.logger.log(`Post ${post.id} is clean (no chat activity). Auto-processing refund...`);

      const refund = await this.refundsService.createRefundRecord({
        postId: post.id,
        accountId: postPayment.accountId,
        scenario,
        refundPercent,
        amountOriginal: postPayment.amountPaid,
        amountRefund: String(amountRefund),
        status: RefundStatus.PENDING, // Tạo PENDING trước
        reason: `[TỰ ĐỘNG] ${scenario} - Hoàn tiền sạch (không có hoạt động nghi ngờ)`,
      });

      // Thực thi hoàn tiền ngay lập tức
      await this.executeRefundToWallet(
        refund.id,
        post.id,
        postPayment.accountId,
        amountRefund,
        scenario,
        refundPercent,
      );

      this.logger.log(
        `Auto-refunded ${amountRefund} VND (${refundPercent}%) to user ${postPayment.accountId} for post ${post.id}`,
      );
    } else {
      // ⚠️ CHỜ ADMIN DUYỆT - Có dấu hiệu bán chui
      this.logger.warn(
        `Post ${post.id} has chat activity (${chatCount} conversation(s)). Creating PENDING refund for admin review (suspected private sale).`,
      );

      const refund = await this.refundsService.createRefundRecord({
        postId: post.id,
        accountId: postPayment.accountId,
        scenario,
        refundPercent,
        amountOriginal: postPayment.amountPaid,
        amountRefund: String(amountRefund),
        status: RefundStatus.PENDING,
        reason: `[TỰ ĐỘNG] ${scenario} - Có hoạt động chat (${chatCount} cuộc trò chuyện). Nghi ngờ bán chui - chờ duyệt của admin.`,
      });

      this.logger.log(
        `Created PENDING refund record ${refund.id} for post ${post.id} - Awaiting admin approval (has ${chatCount} chat conversations)`,
      );
    }
  }

  /**
   * Lấy danh sách posts đang chờ hoàn tiền (đủ điều kiện nhưng chưa được cron job xử lý)
   *
   * Lọc các bài đăng thực sự đủ điều kiện hoàn tiền:
   * - ARCHIVED: Tất cả các bài đã hủy (bất kể số ngày)
   * - PUBLISHED: Chỉ các bài đã hết hạn (>= expirationDays)
   *
   * Note: Không cần kiểm tra chat ở đây vì đây chỉ là pre-filter
   *
   * @returns Danh sách posts ứng cử cho refund
   */
  async getRefundCandidatePosts(): Promise<Post[]> {
    const allCandidates = await this.refundsService.findRefundCandidatePosts();

    // Lấy policy và lifecycle config
    const policy = await this.getRefundPolicy();
    const postLifecycle = await this.postLifecycleService.findOne(1);
    const expirationDays = postLifecycle.expirationDays ?? 30;

    // Filter chỉ lấy các post thực sự đủ điều kiện
    // Note: hasChatActivity = false ở đây vì đây chỉ là pre-filter
    // Chat activity sẽ được kiểm tra trong processRefundForCandidatePost
    const eligiblePosts = allCandidates.filter((post) => {
      const daysSinceReviewed = calculateDaysSinceReviewed(new Date(post.reviewedAt!));
      const refundInfo = getRefundScenarioAndRate(
        post,
        daysSinceReviewed,
        policy,
        expirationDays,
        false, // pre-filter, không cần kiểm tra chat
      );

      // Chỉ trả về post nếu có scenario refund hợp lệ
      return refundInfo !== null;
    });

    return eligiblePosts;
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
