import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Refund } from './entities/refund.entity';
import { RefundStatus } from '../../shared/enums/refund-status.enum';
import { RefundScenario } from '../../shared/enums/refund-scenario.enum';
import { Post } from '../posts/entities/post.entity';
import { PostPayment } from '../transactions/entities/post-payment.entity';
import { RefundPolicyService } from '../settings/service/refund-policy.service';
import { WalletsService } from '../wallets/wallets.service';
import { ManualRefundDto } from './dto/manual-refund.dto';
import type { ReqUser } from '../../core/decorators/current-user.decorator';

/**
 * RefundsService - Query refunds + Manual refund + Approve/Reject
 */
@Injectable()
export class RefundsService {
  constructor(
    @InjectRepository(Refund)
    private readonly refundRepo: Repository<Refund>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(PostPayment)
    private readonly postPaymentRepo: Repository<PostPayment>,
    private readonly refundPolicyService: RefundPolicyService,
    private readonly walletsService: WalletsService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Lấy danh sách refund requests (từ cron)
   */
  async getPendingRefundsForAdmin() {
    return this.refundRepo.find({
      where: { status: RefundStatus.PENDING },
      relations: ['post', 'account'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Lấy tất cả refunds
   */
  async getAllRefunds() {
    return this.refundRepo.find({
      relations: ['post', 'account', 'walletTransaction'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy chi tiết refund request
   */
  async getRefundDetail(refundId: string) {
    const refund = await this.refundRepo.findOne({
      where: { id: refundId },
      relations: ['post', 'account', 'walletTransaction'],
    });

    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    return refund;
  }

  /**
   * Lấy refunds theo postId
   */
  async getRefundsByPostId(postId: string) {
    return this.refundRepo.find({
      where: { postId },
      relations: ['account', 'walletTransaction'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 🔧 Manual refund - Admin refund 1 post cụ thể
   */
  async manualRefund(dto: ManualRefundDto, adminUser: ReqUser) {
    // 1. Lấy post + post_payment
    const post = await this.postRepo.findOne({
      where: { id: dto.postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (!post.reviewedAt) {
      throw new BadRequestException('Post chưa được review (chưa có deposit payment)');
    }

    // 2. Lấy post_payment (post_id là PK)
    const postPayment = await this.postPaymentRepo.findOne({
      where: { postId: dto.postId },
    });

    if (!postPayment) {
      throw new NotFoundException('Post chưa có deposit payment');
    }

    // 3. Check đã refund chưa
    const existingRefund = await this.refundRepo.findOne({
      where: { postId: dto.postId },
    });

    if (existingRefund) {
      throw new BadRequestException(`Post đã được refund rồi (Refund ID: ${existingRefund.id})`);
    }

    // 4. Tính scenario (nếu admin không truyền)
    const scenario = dto.scenario ?? this.calculateScenario(post.reviewedAt);

    // 5. Lấy rate (từ custom hoặc policy)
    const policy = await this.getPolicy();
    const rateFromPolicy = dto.customRate ?? this.getRateByScenario(scenario, policy);
    // Ensure rate is integer (DB column is smallint)
    const rate = Math.round(Number(rateFromPolicy));

    // 6. Tính refund amount
    const amountOriginal = Number(postPayment.amountPaid);
    const amountRefund = Math.floor(amountOriginal * (rate / 100));

    // 7. Dry run - chỉ preview
    // Handle both boolean and string "true"/"false"
    const isDryRun = dto.dryRun === true || dto.dryRun === ('true' as any);
    console.log('[REFUND] dto.dryRun received:', dto.dryRun, 'type:', typeof dto.dryRun);
    console.log('[REFUND] isDryRun:', isDryRun);

    if (isDryRun) {
      console.log('[REFUND] DRY RUN MODE - Not saving to DB');
      return {
        success: true,
        dryRun: true,
        postId: dto.postId,
        accountId: postPayment.accountId,
        scenario,
        rate,
        amountOriginal,
        amountRefund,
        currency: 'VND',
        reason: dto.reason,
      };
    }

    // 8. Create refund request (PENDING status - requires admin approval)
    console.log('[REFUND] Creating PENDING refund request - Requires admin approval');
    return this.dataSource.transaction(async (manager) => {
      // Create refund record with PENDING status
      const refund = this.refundRepo.create({
        postId: dto.postId,
        accountId: postPayment.accountId,
        scenario,
        policyRatePercent: rate,
        amountOriginal: String(amountOriginal),
        amountRefund: String(amountRefund),
        status: RefundStatus.PENDING,
        reason: `[MANUAL] ${dto.reason}`,
      });
      const savedRefund = await manager.getRepository(Refund).save(refund);

      console.log('[REFUND] Refund request created with PENDING status:', savedRefund.id);

      return {
        success: true,
        dryRun: false,
        refundId: savedRefund.id,
        postId: dto.postId,
        accountId: postPayment.accountId,
        amountOriginal,
        amountRefund,
        rate,
        scenario,
        status: RefundStatus.PENDING,
        message: 'Refund request created. Use POST /refunds/:id/decide to approve or reject.',
        createdAt: savedRefund.createdAt,
      };
    });
  }

  /**
   * ✅❌ Admin approve/reject pending refund
   */
  async adminDecideRefund(
    refundId: string,
    decision: 'approve' | 'reject',
    adminUser: ReqUser,
    adminNotes?: string,
  ) {
    const refund = await this.refundRepo.findOne({
      where: { id: refundId },
      relations: ['post'],
    });

    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    if (refund.status !== RefundStatus.PENDING) {
      throw new BadRequestException(`Refund đã được xử lý rồi (status: ${refund.status})`);
    }

    return this.dataSource.transaction(async (manager) => {
      if (decision === 'approve') {
        // Admin approve - thực hiện refund
        try {
          const amountRefund = Number(refund.amountRefund);
          const tx = await this.walletsService.refund(
            Number(refund.accountId),
            String(amountRefund),
            `Refund approved by admin for post ${refund.postId}${adminNotes ? ` - ${adminNotes}` : ''}`,
            refund.id,
          );

          refund.status = RefundStatus.REFUNDED;
          refund.refundedAt = new Date();
          refund.walletTransactionId = tx.transaction.id;
          if (adminNotes) {
            refund.reason = `${refund.reason} | Admin approved: ${adminNotes}`;
          }

          await manager.getRepository(Refund).save(refund);

          return {
            success: true,
            decision: 'approve',
            refundId: refund.id,
            walletTransactionId: refund.walletTransactionId,
            amountRefund,
            refundedAt: refund.refundedAt,
          };
        } catch (err) {
          refund.status = RefundStatus.FAILED;
          refund.reason = `${refund.reason} | Admin approve failed: ${(err as Error).message}`;
          await manager.getRepository(Refund).save(refund);
          throw err;
        }
      } else {
        // Admin reject - không refund
        refund.status = RefundStatus.REJECTED;
        if (adminNotes) {
          refund.reason = `${refund.reason} | Admin rejected: ${adminNotes}`;
        }

        await manager.getRepository(Refund).save(refund);

        return {
          success: true,
          decision: 'reject',
          refundId: refund.id,
          message: 'Refund rejected by admin. Funds retained.',
          reason: refund.reason,
        };
      }
    });
  }

  /**
   * 📊 Helper: Tính scenario dựa vào reviewedAt
   */
  private calculateScenario(reviewedAt: Date): RefundScenario {
    const now = new Date();
    const days = Math.floor((now.getTime() - reviewedAt.getTime()) / (1000 * 60 * 60 * 24));

    if (days < 7) return RefundScenario.CANCEL_EARLY;
    if (days <= 30) return RefundScenario.CANCEL_LATE;
    return RefundScenario.EXPIRED;
  }

  /**
   * 📊 Helper: Lấy rate từ policy theo scenario
   */
  private getRateByScenario(
    scenario: RefundScenario,
    policy: {
      cancelEarlyRate: number | null;
      cancelLateRate: number | null;
      expiredRate: number | null;
      fraudSuspectedRate: number | null;
    },
  ): number {
    switch (scenario) {
      case RefundScenario.CANCEL_EARLY:
        return Number(policy.cancelEarlyRate ?? 100);
      case RefundScenario.CANCEL_LATE:
        return Number(policy.cancelLateRate ?? 70);
      case RefundScenario.EXPIRED:
        return Number(policy.expiredRate ?? 50);
      case RefundScenario.FRAUD_SUSPECTED:
        return Number(policy.fraudSuspectedRate ?? 0);
    }
    throw new BadRequestException('Unknown refund scenario');
  }

  /**
   * 📊 Helper: Lấy policy hiện tại (RefundPolicy luôn có ID = 1)
   */
  private async getPolicy(): Promise<{
    cancelEarlyRate: number | null;
    cancelLateRate: number | null;
    expiredRate: number | null;
    fraudSuspectedRate: number | null;
  }> {
    try {
      return await this.refundPolicyService.findOne(1);
    } catch {
      throw new NotFoundException('Refund policy not found');
    }
  }

  /**
   * Hàm này truy vấn danh sách các bài đăng đã được review, đang ở trạng thái PUBLISHED hoặc
   * ARCHIVED, và chưa từng được hoàn tiền (chưa có record refund).
   */
  async findRefundCandidatePosts(): Promise<Post[]> {
    const posts = await this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.seller', 'seller')
      .leftJoin('refunds', 'refund', 'refund.post_id = post.id')
      .where('post.reviewedAt IS NOT NULL')
      .andWhere('post.status IN (:...statuses)', {
        statuses: ['PUBLISHED', 'ARCHIVED'],
      })
      .andWhere('refund.id IS NULL')
      .getMany();

    return posts;
  }

  /**
   * Tìm payment record của post
   */
  async findPostPaymentByPostId(postId: string): Promise<PostPayment | null> {
    return await this.postPaymentRepo.findOne({
      where: { postId },
      relations: ['account'],
    });
  }

  /**
   * Tạo refund record với status PENDING
   */
  async createRefundRecord(params: {
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
   * Cập nhật refund status thành REFUNDED với transaction info
   */
  async updateRefundAsRefunded(refundId: string, walletTransactionId: number): Promise<Refund> {
    const refund = await this.refundRepo.findOne({ where: { id: refundId } });
    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    refund.status = RefundStatus.REFUNDED;
    refund.walletTransactionId = walletTransactionId;
    refund.refundedAt = new Date();

    return await this.refundRepo.save(refund);
  }

  /**
   * Cập nhật refund status thành FAILED
   */
  async updateRefundAsFailed(refundId: string, reason: string): Promise<Refund> {
    const refund = await this.refundRepo.findOne({ where: { id: refundId } });
    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    refund.status = RefundStatus.FAILED;
    refund.reason = `Auto refund failed: ${reason}`;

    return await this.refundRepo.save(refund);
  }

  /**
   * Kiểm tra xem post đã có refund chưa
   */
  async hasRefundByPostId(postId: string): Promise<boolean> {
    const count = await this.refundRepo.count({ where: { postId } });
    return count > 0;
  }

  /**
   * Tìm post by ID với relations
   */
  async findPostById(postId: string): Promise<Post | null> {
    return await this.postRepo.findOne({
      where: { id: postId },
      relations: ['seller'],
    });
  }
}
