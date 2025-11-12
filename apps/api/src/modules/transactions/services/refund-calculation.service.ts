import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FraudFlagStatus } from '../../post-fraud-flags/entities/post-fraud-flag.entity';
import { PostFraudFlagsService } from '../../post-fraud-flags/post-fraud-flags.service';
import { ChatService } from '../../chat/chat.service';
import { PostPayment } from '../entities';

export interface RefundCalculationResult {
  finalRefundAmount: number;
  appliedRate: number;
  reason: 'FRAUD' | 'CHAT_ACTIVITY' | 'FULL_REFUND';
  originalAmount: number;
  penaltyAmount: number;
  details: string;
}

@Injectable()
export class RefundCalculationService {
  constructor(
    @InjectRepository(PostPayment)
    private readonly postPaymentRepo: Repository<PostPayment>,
    private readonly fraudFlagsService: PostFraudFlagsService,
    private readonly chatService: ChatService,
  ) {}

  async calculateServiceFeeRefund(postId: string): Promise<RefundCalculationResult> {
    const payment = await this.postPaymentRepo.findOne({
      where: { postId },
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment record not found for post ID: ${postId}. Cannot calculate refund.`,
      );
    }

    const originalAmount = Number.parseFloat(payment.amountPaid);

    // Rule 1: Check fraud flag (HIGHEST PRIORITY)
    const fraudFlag = await this.fraudFlagsService.getFlagByPostId(postId);

    if (
      fraudFlag &&
      (fraudFlag.status === FraudFlagStatus.SUSPECTED ||
        fraudFlag.status === FraudFlagStatus.CONFIRMED)
    ) {
      return {
        finalRefundAmount: 0,
        appliedRate: 0.0,
        reason: 'FRAUD',
        originalAmount,
        penaltyAmount: originalAmount,
        details: `Post flagged as fraud (${fraudFlag.status}). No refund.`,
      };
    }

    // Rule 2: Check chat activity (prevent offline transactions)
    const hasChatActivity = await this.chatService.hasPostChatActivity(postId);

    if (hasChatActivity) {
      const chatCount = await this.chatService.getPostChatActivityCount(postId);
      const appliedRate = 0.8;
      const finalRefundAmount = originalAmount * appliedRate;
      const penaltyAmount = originalAmount * 0.2;

      return {
        finalRefundAmount: Number.parseFloat(finalRefundAmount.toFixed(2)),
        appliedRate,
        reason: 'CHAT_ACTIVITY',
        originalAmount,
        penaltyAmount: Number.parseFloat(penaltyAmount.toFixed(2)),
        details: `Detected ${chatCount} conversations with messages. Suspected offline transaction. 20% penalty applied.`,
      };
    }

    // Rule 3: Clean user - full refund
    const appliedRate = 1.0;
    const finalRefundAmount = originalAmount;

    return {
      finalRefundAmount: Number.parseFloat(finalRefundAmount.toFixed(2)),
      appliedRate,
      reason: 'FULL_REFUND',
      originalAmount,
      penaltyAmount: 0,
      details: 'No fraud or offline transaction detected. Full refund applied.',
    };
  }

  async getRefundDetails(postId: string): Promise<{
    hasFraudFlag: boolean;
    fraudStatus?: string;
    conversationsCount: number;
    conversationsWithMessagesCount: number;
    estimatedRefundRate: number;
  }> {
    const fraudFlag = await this.fraudFlagsService.getFlagByPostId(postId);
    const hasChatActivity = await this.chatService.hasPostChatActivity(postId);
    const conversationsWithMessagesCount = await this.chatService.getPostChatActivityCount(postId);

    let estimatedRefundRate = 1.0;

    if (
      fraudFlag &&
      (fraudFlag.status === FraudFlagStatus.SUSPECTED ||
        fraudFlag.status === FraudFlagStatus.CONFIRMED)
    ) {
      estimatedRefundRate = 0.0;
    } else if (hasChatActivity) {
      estimatedRefundRate = 0.8;
    }

    return {
      hasFraudFlag: !!fraudFlag,
      fraudStatus: fraudFlag?.status,
      conversationsCount: conversationsWithMessagesCount,
      conversationsWithMessagesCount,
      estimatedRefundRate,
    };
  }
}
