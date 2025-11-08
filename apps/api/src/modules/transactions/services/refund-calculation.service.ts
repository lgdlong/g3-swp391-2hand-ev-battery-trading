import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostFraudFlag } from '../../post-fraud-flags/entities/post-fraud-flag.entity';
import { Conversation } from '../../chat/entities/conversation.entity';
import { PostPayment } from '../entities';

/**
 * Refund Calculation Result
 */
export interface RefundCalculationResult {
  finalRefundAmount: number;
  appliedRate: number;
  reason: 'FRAUD' | 'CHAT_ACTIVITY' | 'FULL_REFUND';
  originalAmount: number;
  penaltyAmount: number;
  details: string;
}

/**
 * Service để tính toán số tiền hoàn lại khi người bán hủy bài đăng
 * Implement logic chống "giao dịch chui" (offline transactions)
 */
@Injectable()
export class RefundCalculationService {
  constructor(
    @InjectRepository(PostPayment)
    private readonly postPaymentRepo: Repository<PostPayment>,
    @InjectRepository(PostFraudFlag)
    private readonly fraudFlagRepo: Repository<PostFraudFlag>,
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
  ) {}

  /**
   * Tính toán số tiền hoàn lại cho người bán khi hủy bài đăng
   *
   * Logic ưu tiên (theo thứ tự):
   * 1. Kiểm tra Gian lận -> 0% refund
   * 2. Kiểm tra Hoạt động Chat -> 80% refund (phạt 20%)
   * 3. Người dùng "Trong sạch" -> 100% refund
   *
   * @param postId - ID của bài đăng cần tính toán hoàn tiền
   * @returns RefundCalculationResult với số tiền hoàn lại và lý do
   * @throws NotFoundException nếu không tìm thấy payment record
   */
  async calculateServiceFeeRefund(postId: string): Promise<RefundCalculationResult> {
    // ============================================
    // BƯỚC 1: Lấy Phí Gốc từ post_payments
    // ============================================
    const payment = await this.postPaymentRepo.findOne({
      where: { postId },
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment record not found for post ID: ${postId}. Cannot calculate refund.`,
      );
    }

    const originalAmount = Number.parseFloat(payment.amountPaid);

    // ============================================
    // BƯỚC 2: QUY TẮC 1 - Kiểm tra Gian lận (HIGHEST PRIORITY)
    // ============================================
    const fraudFlag = await this.fraudFlagRepo.findOne({
      where: { postId },
    });

    if (fraudFlag && (fraudFlag.status === 'SUSPECTED' || fraudFlag.status === 'CONFIRMED')) {
      return {
        finalRefundAmount: 0,
        appliedRate: 0.0,
        reason: 'FRAUD',
        originalAmount,
        penaltyAmount: originalAmount,
        details: `Bài đăng bị đánh dấu gian lận (${fraudFlag.status}). Không được hoàn tiền.`,
      };
    }

    // ============================================
    // BƯỚC 3: QUY TẮC 2 - Kiểm tra Hoạt động Chat (Chống "Giao dịch chui")
    // ============================================
    const conversationsWithMessages = await this.conversationRepo.count({
      where: {
        postId,
        hasMessages: true,
      },
    });

    if (conversationsWithMessages > 0) {
      const appliedRate = 0.8; // Hoàn 80%, phạt 20%
      const finalRefundAmount = originalAmount * appliedRate;
      const penaltyAmount = originalAmount * 0.2;

      return {
        finalRefundAmount: Number.parseFloat(finalRefundAmount.toFixed(2)),
        appliedRate,
        reason: 'CHAT_ACTIVITY',
        originalAmount,
        penaltyAmount: Number.parseFloat(penaltyAmount.toFixed(2)),
        details: `Phát hiện ${conversationsWithMessages} cuộc hội thoại có tin nhắn. Nghi ngờ "giao dịch chui". Phạt 20% phí dịch vụ.`,
      };
    }

    // ============================================
    // BƯỚC 4: QUY TẮC 3 - Người dùng "Trong sạch" (FULL REFUND)
    // ============================================
    return {
      finalRefundAmount: originalAmount,
      appliedRate: 1.0,
      reason: 'FULL_REFUND',
      originalAmount,
      penaltyAmount: 0,
      details: 'Không phát hiện gian lận hoặc hoạt động đáng ngờ. Hoàn 100% phí dịch vụ.',
    };
  }

  /**
   * Kiểm tra xem bài đăng có đủ điều kiện được hoàn tiền không
   * (Có thể thêm logic kiểm tra thời gian hủy, trạng thái bài đăng, etc.)
   *
   * @param postId - ID của bài đăng
   * @returns true nếu đủ điều kiện hoàn tiền
   */
  async isEligibleForRefund(postId: string): Promise<boolean> {
    const payment = await this.postPaymentRepo.findOne({
      where: { postId },
    });

    // Nếu không có payment record, không thể hoàn tiền
    if (!payment) {
      return false;
    }

    // TODO: Có thể thêm logic kiểm tra thời gian
    // Ví dụ: Chỉ được hoàn tiền trong vòng 7 ngày kể từ khi thanh toán
    // const daysSincePayment = differenceInDays(new Date(), payment.createdAt);
    // if (daysSincePayment > 7) {
    //   return false;
    // }

    return true;
  }

  /**
   * Lấy thông tin chi tiết về lý do hoàn tiền
   * (Dùng cho admin hoặc user notification)
   *
   * @param postId - ID của bài đăng
   * @returns Object chứa thông tin chi tiết
   */
  async getRefundDetails(postId: string): Promise<{
    hasFraudFlag: boolean;
    fraudStatus?: string;
    conversationsCount: number;
    conversationsWithMessagesCount: number;
    estimatedRefundRate: number;
  }> {
    const fraudFlag = await this.fraudFlagRepo.findOne({
      where: { postId },
    });

    const conversationsCount = await this.conversationRepo.count({
      where: { postId },
    });

    const conversationsWithMessagesCount = await this.conversationRepo.count({
      where: {
        postId,
        hasMessages: true,
      },
    });

    // Estimate refund rate based on current data
    let estimatedRefundRate = 1.0; // Default: 100%

    if (fraudFlag && (fraudFlag.status === 'SUSPECTED' || fraudFlag.status === 'CONFIRMED')) {
      estimatedRefundRate = 0.0;
    } else if (conversationsWithMessagesCount > 0) {
      estimatedRefundRate = 0.8;
    }

    return {
      hasFraudFlag: !!fraudFlag,
      fraudStatus: fraudFlag?.status,
      conversationsCount,
      conversationsWithMessagesCount,
      estimatedRefundRate,
    };
  }
}
