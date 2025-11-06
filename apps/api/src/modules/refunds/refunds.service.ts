import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Refund } from './entities/refund.entity';
import { RefundStatus } from '../../shared/enums/refund-status.enum';
import { RefundScenario } from '../../shared/enums/refund-scenario.enum';
import { Post } from '../posts/entities/post.entity';
import { PostPayment } from '../transactions/entities/post-payment.entity';
import { RefundPolicy } from '../settings/entities/refund-policy.entity';
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
    @InjectRepository(RefundPolicy)
    private readonly policyRepo: Repository<RefundPolicy>,
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
    const isDryRun = dto.dryRun === true || dto.dryRun === 'true' as any;
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
      throw new BadRequestException(
        `Refund đã được xử lý rồi (status: ${refund.status})`,
      );
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
  private getRateByScenario(scenario: RefundScenario, policy: RefundPolicy): number {
    switch (scenario) {
      case RefundScenario.CANCEL_EARLY:
        return Number(policy.cancelEarlyRate ?? 100);
      case RefundScenario.CANCEL_LATE:
        return Number(policy.cancelLateRate ?? 70);
      case RefundScenario.EXPIRED:
        return Number(policy.expiredRate ?? 50);
      case RefundScenario.FRAUD_SUSPECTED:
        return Number(policy.fraudSuspectedRate ?? 0);
      default:
        throw new BadRequestException(`Unknown scenario: ${scenario}`);
    }
  }

  /**
   * 📊 Helper: Lấy policy hiện tại
   */
  private async getPolicy(): Promise<RefundPolicy> {
    const policy = await this.policyRepo.findOne({ where: {} });
    if (!policy) {
      throw new NotFoundException('Refund policy not found');
    }
    return policy;
  }
}
