import { PostLifecycle } from '../entities/post-lifecycle.entity';
import { PostLifecycleResponseDto } from '../dto/settings-response.dto';

export class PostLifecycleMapper {
  static toResponseDto(entity: PostLifecycle): PostLifecycleResponseDto {
    return {
      id: entity.id,
      expirationDays: entity.expirationDays,
      autoApprove: entity.autoApprove,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponseDtoArray(entities: PostLifecycle[]): PostLifecycleResponseDto[] {
    return entities.map((entity) => PostLifecycleMapper.toResponseDto(entity));
  }
}
