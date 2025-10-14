import { Injectable } from '@nestjs/common';
import { PostReviewLog } from '../entities/post-review-log.entity';
import { PostReviewLogResponseDto, ActorDto } from '../dto/post-review-log-response.dto';

@Injectable()
export class PostReviewLogMapper {
  static toResponseDto(entity: PostReviewLog): PostReviewLogResponseDto {
    const actorDto: ActorDto | null = entity.actor
      ? {
          id: entity.actor.id.toString(),
          displayName: entity.actor.fullName,
        }
      : null;

    return {
      id: entity.id,
      postId: entity.postId,
      action: entity.action,
      oldStatus: entity.oldStatus,
      newStatus: entity.newStatus,
      reason: entity.reason,
      actorId: entity.actorId,
      actor: actorDto,
      createdAt: entity.createdAt.toISOString(),
    };
  }

  static toResponseDtoArray(entities: PostReviewLog[]): PostReviewLogResponseDto[] {
    return entities.map((entity) => this.toResponseDto(entity));
  }
}
