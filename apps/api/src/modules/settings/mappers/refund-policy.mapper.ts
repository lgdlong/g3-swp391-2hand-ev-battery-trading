import { RefundPolicy } from '../entities/refund-policy.entity';
import { RefundPolicyResponseDto } from '../dto/settings-response.dto';

export class RefundPolicyMapper {
  static toResponseDto(entity: RefundPolicy): RefundPolicyResponseDto {
    return {
      id: entity.id,
      cancelEarlyRate: entity.cancelEarlyRate,
      expiredRate: entity.expiredRate,
      fraudSuspectedRate: entity.fraudSuspectedRate,
      holdDays: entity.holdDays,
      autoRefundAfterDays: entity.autoRefundAfterDays,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponseDtoArray(entities: RefundPolicy[]): RefundPolicyResponseDto[] {
    return entities.map((entity) => RefundPolicyMapper.toResponseDto(entity));
  }
}
