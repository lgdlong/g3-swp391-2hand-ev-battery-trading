import { FeeTier } from '../entities/fee-tier.entity';
import { FeeTierResponseDto } from '../dto/settings-response.dto';

export class FeeTierMapper {
  static toResponseDto(entity: FeeTier): FeeTierResponseDto {
    return {
      id: entity.id,
      minPrice: entity.minPrice,
      maxPrice: entity.maxPrice,
      postingFee: entity.postingFee,
      active: entity.active,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponseDtoArray(entities: FeeTier[]): FeeTierResponseDto[] {
    return entities.map((entity) => FeeTierMapper.toResponseDto(entity));
  }
}
