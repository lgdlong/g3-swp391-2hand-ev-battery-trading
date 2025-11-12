import { RefundPolicy } from '../entities/refund-policy.entity';
import { RefundPolicyResponseDto } from '../dto/settings-response.dto';

export class RefundPolicyMapper {
  static toResponseDto(entity: RefundPolicy): RefundPolicyResponseDto {
    return {
      id: entity.id,
      cancelEarlyRate: entity.cancelEarlyRate,
      cancelLateRate: entity.cancelLateRate,
      expiredRate: entity.expiredRate,
      fraudSuspectedRate: entity.fraudSuspectedRate,
      cancelEarlyDaysThreshold: entity.cancelEarlyDaysThreshold,
      cancelLateDaysThreshold: entity.cancelLateDaysThreshold,
      holdDays: entity.holdDays,
      autoRefundAfterDays: entity.autoRefundAfterDays,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponseDtoArray(entities: RefundPolicy[]): RefundPolicyResponseDto[] {
    return entities.map((entity) => RefundPolicyMapper.toResponseDto(entity));
  }
}
