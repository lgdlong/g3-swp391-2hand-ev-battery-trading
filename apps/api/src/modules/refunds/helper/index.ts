import { Post } from '../../posts/entities/post.entity';
import { PostStatus } from '../../../shared/enums/post.enum';
import { RefundScenario } from '../../../shared/enums/refund-scenario.enum';

/**
 * Type định nghĩa RefundPolicy config
 */
export interface RefundPolicyConfig {
  cancelEarlyRate: number;
  cancelLateRate: number;
  expiredRate: number;
  fraudSuspectedRate: number;
  cancelEarlyDaysThreshold: number;
  cancelLateDaysThreshold: number;
}

/**
 * Giá trị mặc định của RefundPolicy
 */
export const DEFAULT_REFUND_POLICY: RefundPolicyConfig = {
  cancelEarlyRate: 1.0, // 100%
  cancelLateRate: 0.7, // 70%
  expiredRate: 0.5, // 50%
  fraudSuspectedRate: 0.0, // 0%
  cancelEarlyDaysThreshold: 7,
  cancelLateDaysThreshold: 7,
};

/**
 * Tính số ngày từ khi post được duyệt đến hiện tại
 *
 * @param reviewedAt - Thời điểm post được duyệt
 * @returns Số ngày đã trôi qua
 */
export function calculateDaysSinceReviewed(reviewedAt: Date): number {
  const now = new Date();
  return Math.floor((now.getTime() - reviewedAt.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Xác định scenario và tỷ lệ refund dựa trên status và số ngày
 *
 * @param post - Post cần kiểm tra
 * @param daysSinceReviewed - Số ngày từ khi post được duyệt
 * @param policy - RefundPolicy config từ database
 * @param expirationDays - Số ngày hết hạn của post từ PostLifecycle
 * @param hasChatActivity - Có hoạt động chat hay không (chống bán chui)
 * @returns Object chứa scenario và rate, hoặc null nếu không đủ điều kiện refund
 */
export function getRefundScenarioAndRate(
  post: Post,
  daysSinceReviewed: number,
  policy: RefundPolicyConfig,
  expirationDays: number,
  hasChatActivity: boolean = false,
): { scenario: RefundScenario; rate: number } | null {
  // Post đã bị user hủy (ARCHIVED)
  if (post.status === PostStatus.ARCHIVED) {
    // 🔒 LOGIC CHỐNG BÁN CHUI (ƯU TIÊN HƠN THỜI GIAN)
    if (hasChatActivity) {
      // Có chat, luôn tính là Hủy Trễ (hoặc 1 kịch bản "Bán chui" riêng nếu bạn muốn)
      return {
        scenario: RefundScenario.CANCEL_LATE,
        rate: policy.cancelLateRate ?? 0.7,
      };
    }

    // LOGIC HỦY SỚM (CHỈ KHI KHÔNG CÓ CHAT)
    const threshold = policy.cancelEarlyDaysThreshold ?? 7;
    if (daysSinceReviewed < threshold) {
      // Hủy sớm: sử dụng rate từ DB
      return {
        scenario: RefundScenario.CANCEL_EARLY,
        rate: policy.cancelEarlyRate ?? 1.0,
      };
    } else {
      // Hủy trễ: sử dụng rate từ DB
      return {
        scenario: RefundScenario.CANCEL_LATE,
        rate: policy.cancelLateRate ?? 0.7,
      };
    }
  }

  // Post đang published
  if (post.status === PostStatus.PUBLISHED) {
    // Sử dụng expirationDays từ PostLifecycle
    if (daysSinceReviewed >= expirationDays) {
      // Hết hạn: sử dụng rate từ DB
      return {
        scenario: RefundScenario.EXPIRED,
        rate: policy.expiredRate ?? 0.5,
      };
    } else {
      // Chưa hết hạn, không refund
      return null;
    }
  }

  // Status không hợp lệ
  return null;
}
