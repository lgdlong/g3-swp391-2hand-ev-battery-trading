// src/modules/refunds/refunds.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RefundRequestDto, RefundScenario } from './dto/refund-request.dto';
import { PaymentOrder } from '../payos/entities/payment-order.entity';
import { WalletsService } from '../wallets/wallets.service';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import { ReqUser } from 'src/core/decorators/current-user.decorator';
// Nếu có Post entity và muốn auto archive bài thì import thêm:
// import { Post } from '../posts/entities/post.entity';
// import { PostStatus } from 'src/shared/enums/post-status.enum';

@Injectable()
export class RefundsService {
  constructor(
    @InjectRepository(PaymentOrder) private readonly poRepo: Repository<PaymentOrder>,
    private readonly wallets: WalletsService,
    private readonly ds: DataSource,
  ) {}

  /** Đọc snapshot policy: có thể thay bằng SettingsService nếu bạn đã có */
  private async getPolicy() {
    return {
      cancelEarlyRate: 100,  // CANCEL_EARLY
      expiredRate: 80,       // EXPIRED
      highInteractionRate: 50, // HIGH_INTERACTION
      fraudSuspectedRate: 0, // FRAUD_SUSPECTED (0 => HOLD)
      holdDays: 7,
    };
  }

  private getRateByScenario(s: RefundScenario, policy: Awaited<ReturnType<RefundsService['getPolicy']>>): number {
    switch (s) {
      case RefundScenario.CANCEL_EARLY:
        return policy.cancelEarlyRate;
      case RefundScenario.EXPIRED:
        return policy.expiredRate;
      case RefundScenario.HIGH_INTERACTION:
        return policy.highInteractionRate;
      case RefundScenario.FRAUD_SUSPECTED:
        return policy.fraudSuspectedRate;
      default:
        return 0;
    }
  }

  async handleRefund(dto: RefundRequestDto) {
    // 1) Locate payment order
    const po = await this.poRepo.findOne({
      where: dto.orderCode ? { orderCode: dto.orderCode } : { id: String(dto.paymentOrderId!) },
    });
    if (!po) throw new NotFoundException('Payment order not found');

    if (po.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only COMPLETED orders can be refunded/held');
    }

    // 2) Policy + calc
    const policy = await this.getPolicy();
    const rate = this.getRateByScenario(dto.scenario, policy);
    const amount = Number(po.amount) || 0;
    const refundableAmount = Math.floor(amount * (rate / 100));
    const willHold = dto.scenario === RefundScenario.FRAUD_SUSPECTED && rate === 0;

    // 3) Dry run? just preview
    if (dto.dryRun) {
      return {
        success: true,
        dryRun: true,
        orderCode: po.orderCode ?? null,
        paymentOrderId: po.id,
        payerAccountId: po.accountId,
        scenario: dto.scenario,
        policyRatePercent: rate,
        refundableAmount,
        currency: 'VND',
        notes: willHold ? `HOLD ${policy.holdDays} days` : dto.reason,
      };
    }

    // 4) Execute (transaction)
    return this.ds.transaction(async (tm) => {
      let walletTxId: number | undefined;

      if (willHold) {
        // chỉ hold: bạn có thể thêm cột/trạng thái HELD trong PaymentStatus
        po.status = PaymentStatus.COMPLETED as any; // hoặc giữ COMPLETED + lưu processing_notes ở webhook_logs
      } else {
        // hoàn tiền vào ví - wallets.topUp(userId, amount, description?, paymentOrderId?)
        const tx = await this.wallets.topUp(
          po.accountId,
          String(refundableAmount),
          `Refund ${rate}% for order ${po.orderCode || po.id}`,
          String(po.id),
        );
        walletTxId = tx.transaction?.id;
        po.status = PaymentStatus.COMPLETED;
        (po as any).refundedAt = new Date();
      }

      await tm.getRepository(PaymentOrder).save(po);

      // (Tuỳ) nếu muốn tự archive bài theo payable:
      // if (po.payableType === 'POST' && po.payableId) {
      //   await tm.getRepository(Post).update({ id: po.payableId }, { status: PostStatus.ARCHIVED, archivedAt: () => 'CURRENT_TIMESTAMP' as any });
      // }

      return {
        success: true,
        dryRun: false,
        orderCode: po.orderCode ?? null,
        paymentOrderId: po.id,
        payerAccountId: po.accountId,
        scenario: dto.scenario,
        policyRatePercent: rate,
        refundableAmount,
        currency: 'VND',
        walletTransactionId: walletTxId,
        paymentOrderStatus: po.status,
        refundedAt: (po as any).refundedAt ?? null,
        notes: willHold ? `HOLD ${policy.holdDays} days` : dto.reason,
      };
    });
  }
}
