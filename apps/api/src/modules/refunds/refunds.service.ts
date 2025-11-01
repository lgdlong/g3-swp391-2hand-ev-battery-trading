import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Refund } from './entities/refund.entity';
import { RefundRequestDto } from './dto/refund-request.dto';
import { RefundStatus } from '../../shared/enums/refund-status.enum';
import { RefundScenario } from '../../shared/enums/refund-scenario.enum';
import { PaymentOrder } from '../payos/entities/payment-order.entity';
import { RefundPolicy } from '../settings/entities/refund-policy.entity';
import { WalletsService } from '../wallets/wallets.service';
import { ReqUser } from '../../core/decorators/current-user.decorator';
import { PaymentStatus } from '../../shared/enums/payment-status.enum';

@Injectable()
export class RefundsService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Refund)
    private readonly refundRepo: Repository<Refund>,

    @InjectRepository(PaymentOrder)
    private readonly paymentOrderRepo: Repository<PaymentOrder>,

    @InjectRepository(RefundPolicy)
    private readonly refundPolicyRepo: Repository<RefundPolicy>,

    private readonly walletsService: WalletsService,
  ) {}

  /**
   * Lấy chính sách hoàn tiền hiện tại
   */
  async getPolicy(): Promise<RefundPolicy> {
    const policy = await this.refundPolicyRepo.findOne({ where: {} });
    if (!policy) throw new NotFoundException('Refund policy not found');
    return policy;
  }

  /**
   * Lấy tỉ lệ hoàn tiền dựa trên scenario
   */
  getRateByScenario(scenario: RefundScenario, policy: RefundPolicy): number {
    switch (scenario) {
      case RefundScenario.CANCEL_EARLY:
        return Number(policy.cancelEarlyRate ?? 0);
      case RefundScenario.EXPIRED:
        return Number(policy.expiredRate ?? 0);
      case RefundScenario.HIGH_INTERACTION:
        return Number(policy.fraudSuspectedRate ?? 0); // hoặc thêm field riêng nếu bạn tách high_interaction_rate
      case RefundScenario.FRAUD_SUSPECTED:
        return Number(policy.fraudSuspectedRate ?? 0);
      default:
        throw new BadRequestException(`Unknown refund scenario: ${scenario}`);
    }
  }

  /**
   * Thực hiện hoặc mô phỏng refund
   * Flow mới:
   * - EXPIRED (hết hạn không gian lận): 80% auto refund
   * - CANCEL_EARLY (hủy sớm): 100% auto refund
   * - HIGH_INTERACTION (hủy sau tương tác cao): 50% auto hoặc admin decide
   * - FRAUD_SUSPECTED (gian lận): HOLD 3-5 ngày → admin quyết định
   */
  async handleRefund(dto: RefundRequestDto, user: ReqUser) {
    // 1️⃣ Tìm PaymentOrder
    const paymentOrder = await this.paymentOrderRepo.findOne({
      where: dto.orderCode
        ? { orderCode: dto.orderCode }
        : { id: dto.paymentOrderId as any },
    });
    if (!paymentOrder) throw new NotFoundException('Payment order not found');

    // 2️⃣ Kiểm tra trạng thái hợp lệ
    if (paymentOrder.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only COMPLETED orders can be refunded');
    }

    // 3️⃣ Tính tỉ lệ refund theo policy
    const policy = await this.getPolicy();
    const rate = this.getRateByScenario(dto.scenario, policy);
    const amountOriginal = Number(paymentOrder.amount);
    const amountRefund = Math.floor(amountOriginal * (rate / 100));

    // 4️⃣ Kiểm tra xem có cần admin review không
    const needsAdminReview = this.requiresAdminReview(dto.scenario);

    // 5️⃣ Nếu dryRun => chỉ trả preview
    if (dto.dryRun) {
      return {
        success: true,
        dryRun: true,
        orderCode: paymentOrder.orderCode,
        paymentOrderId: paymentOrder.id,
        accountId: paymentOrder.accountId,
        scenario: dto.scenario,
        policyRatePercent: rate,
        refundableAmount: amountRefund,
        currency: 'VND',
        needsAdminReview,
        notes: dto.reason ?? null,
      };
    }

    // 6️⃣ Xử lý refund theo scenario
    if (needsAdminReview) {
      // Các case cần admin review: FRAUD_SUSPECTED hoặc HIGH_INTERACTION (tùy config)
      return this.createRefundForAdminReview(
        paymentOrder,
        dto,
        rate,
        amountOriginal,
        amountRefund,
        user,
      );
    } else {
      // Auto refund cho EXPIRED, CANCEL_EARLY
      return this.processAutoRefund(
        paymentOrder,
        dto,
        rate,
        amountOriginal,
        amountRefund,
        user,
      );
    }
  }

  /**
   * Kiểm tra xem scenario có cần admin review không
   */
  private requiresAdminReview(scenario: RefundScenario): boolean {
    // FRAUD_SUSPECTED luôn cần admin review
    // HIGH_INTERACTION có thể config để cần admin review hoặc auto
    return (
      scenario === RefundScenario.FRAUD_SUSPECTED ||
      scenario === RefundScenario.HIGH_INTERACTION // TODO: có thể làm config
    );
  }

  /**
   * Tạo refund request để admin review sau (FRAUD case)
   * Status: PENDING_ADMIN_REVIEW
   * Hold 3-5 ngày
   */
  private async createRefundForAdminReview(
    paymentOrder: PaymentOrder,
    dto: RefundRequestDto,
    rate: number,
    amountOriginal: number,
    amountRefund: number,
    user: ReqUser,
  ) {
    return this.dataSource.transaction(async (manager) => {
      // Tạo refund record với status PENDING (chờ admin)
      const refund = this.refundRepo.create({
        paymentOrderId: String(paymentOrder.id),
        accountId: String(paymentOrder.accountId),
        scenario: dto.scenario,
        policyRatePercent: rate,
        amountOriginal: String(amountOriginal),
        amountRefund: String(amountRefund),
        status: RefundStatus.PENDING, // Chờ admin review
        reason: dto.reason ?? null,
        performedByAdminId: null, // Chưa có admin nào xử lý
        // Hold 3-5 ngày (có thể config)
        heldUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      });
      await manager.getRepository(Refund).save(refund);

      // Cập nhật PaymentOrder status (optional: có thể thêm REFUND_PENDING)
      // paymentOrder.status = PaymentStatus.REFUND_PENDING;
      // await manager.getRepository(PaymentOrder).save(paymentOrder);

      return {
        success: true,
        needsAdminReview: true,
        refundId: refund.id,
        paymentOrderId: paymentOrder.id,
        status: RefundStatus.PENDING,
        message: 'Refund request created. Awaiting admin review (hold 3-5 days)',
        refundableAmount: amountRefund,
        scenario: dto.scenario,
        heldUntil: refund.heldUntil,
      };
    });
  }

  /**
   * Xử lý auto refund cho các case không cần admin review
   * (EXPIRED 80%, CANCEL_EARLY 100%)
   */
  private async processAutoRefund(
    paymentOrder: PaymentOrder,
    dto: RefundRequestDto,
    rate: number,
    amountOriginal: number,
    amountRefund: number,
    user: ReqUser,
  ) {
    return this.dataSource.transaction(async (manager) => {
      // Tạo bản ghi refund
      const refund = this.refundRepo.create({
        paymentOrderId: String(paymentOrder.id),
        accountId: String(paymentOrder.accountId),
        scenario: dto.scenario,
        policyRatePercent: rate,
        amountOriginal: String(amountOriginal),
        amountRefund: String(amountRefund),
        status: RefundStatus.PENDING,
        reason: dto.reason ?? null,
        performedByAdminId: String(user.sub), // user.sub là ID
      });
      await manager.getRepository(Refund).save(refund);

      try {
        // Gọi walletsService để hoàn tiền vào ví
        const tx = await this.walletsService.topUp(
          Number(paymentOrder.accountId),
          String(amountRefund),
          `Refund ${rate}% for order ${paymentOrder.orderCode || paymentOrder.id} (${dto.scenario})`,
          String(paymentOrder.id),
        );

        // Cập nhật refund (giữ nguyên paymentOrder.status = COMPLETED)
        refund.status = RefundStatus.REFUNDED;
        refund.refundedAt = new Date();
        refund.walletTransactionId = String(tx.transaction.id);

        // PaymentOrder vẫn giữ status COMPLETED, không đổi thành REFUNDED

        await manager.getRepository(Refund).save(refund);
        // Không cần update PaymentOrder status

        return {
          success: true,
          dryRun: false,
          refundId: refund.id,
          paymentOrderId: paymentOrder.id,
          walletTransactionId: refund.walletTransactionId,
          refundableAmount: amountRefund,
          status: refund.status,
          refundedAt: refund.refundedAt,
          scenario: dto.scenario,
        };
      } catch (err) {
        refund.status = RefundStatus.FAILED;
        refund.reason = (err as Error).message;
        await manager.getRepository(Refund).save(refund);
        throw err;
      }
    });
  }

  /**
   * Admin approve/reject refund request
   * Dùng cho FRAUD_SUSPECTED hoặc HIGH_INTERACTION cases
   */
  async adminDecideRefund(
    refundId: string,
    decision: 'approve' | 'reject',
    adminUser: ReqUser,
    adminNotes?: string,
  ) {
    const refund = await this.refundRepo.findOne({
      where: { id: refundId },
      relations: ['paymentOrder'],
    });

    if (!refund) {
      throw new NotFoundException('Refund request not found');
    }

    if (refund.status !== RefundStatus.PENDING) {
      throw new BadRequestException(
        `Refund already processed with status: ${refund.status}`,
      );
    }

    // Kiểm tra hold period (3-5 ngày) đã hết chưa
    if (refund.heldUntil && new Date() < refund.heldUntil) {
      throw new BadRequestException(
        `Refund is still on hold until ${refund.heldUntil.toISOString()}`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      if (decision === 'approve') {
        // Admin approve → thực hiện refund
        try {
          const amountRefund = Number(refund.amountRefund);
          const tx = await this.walletsService.topUp(
            Number(refund.accountId),
            String(amountRefund),
            `Refund approved by admin for order ${refund.paymentOrder.orderCode || refund.paymentOrderId}`,
            String(refund.paymentOrderId),
          );

          refund.status = RefundStatus.REFUNDED;
          refund.refundedAt = new Date();
          refund.walletTransactionId = String(tx.transaction.id);
          refund.performedByAdminId = String(adminUser.sub);
          refund.reason = adminNotes
            ? `${refund.reason} | Admin notes: ${adminNotes}`
            : refund.reason;

          // PaymentOrder vẫn giữ status COMPLETED, không đổi

          await manager.getRepository(Refund).save(refund);
          // Không cần update PaymentOrder status

          return {
            success: true,
            decision: 'approve',
            refundId: refund.id,
            walletTransactionId: refund.walletTransactionId,
            refundedAmount: amountRefund,
            refundedAt: refund.refundedAt,
          };
        } catch (err) {
          refund.status = RefundStatus.FAILED;
          refund.reason = `Admin approve failed: ${(err as Error).message}`;
          refund.performedByAdminId = String(adminUser.sub);
          await manager.getRepository(Refund).save(refund);
          throw err;
        }
      } else {
        // Admin reject → giữ tiền, không hoàn
        refund.status = RefundStatus.REJECTED;
        refund.performedByAdminId = String(adminUser.sub);
        refund.reason = adminNotes
          ? `${refund.reason} | Admin rejected: ${adminNotes}`
          : refund.reason;

        // TODO: Có thể chuyển tiền vào system wallet hoặc giữ lại

        await manager.getRepository(Refund).save(refund);

        return {
          success: true,
          decision: 'reject',
          refundId: refund.id,
          message: 'Refund request rejected by admin. Funds retained.',
        };
      }
    });
  }

  /**
   * Lấy danh sách refund requests cần admin review
   */
  async getPendingRefundsForAdmin() {
    return this.refundRepo.find({
      where: { status: RefundStatus.PENDING },
      relations: ['paymentOrder', 'account'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Lấy chi tiết refund request
   */
  async getRefundDetail(refundId: string) {
    const refund = await this.refundRepo.findOne({
      where: { id: refundId },
      relations: ['paymentOrder', 'account', 'performedByAdmin'],
    });

    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    return refund;
  }
}
