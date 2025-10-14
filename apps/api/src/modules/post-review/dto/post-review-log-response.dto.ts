import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewActionEnum } from '../../../shared/enums/review.enum';
import { PostStatus } from '../../../shared/enums/post.enum';

export class ActorDto {
  @ApiProperty({ example: '1' })
  id!: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  displayName?: string | null;
}

export class PostReviewLogResponseDto {
  @ApiProperty({ example: '101' })
  id!: string;

  @ApiProperty({ example: '123' })
  postId!: string;

  @ApiProperty({ enum: ReviewActionEnum, example: ReviewActionEnum.REJECTED })
  action!: ReviewActionEnum;

  @ApiPropertyOptional({ enum: PostStatus, example: PostStatus.PENDING_REVIEW })
  oldStatus?: PostStatus | null;

  @ApiPropertyOptional({ enum: PostStatus, example: PostStatus.PUBLISHED })
  newStatus?: PostStatus | null;

  @ApiPropertyOptional({ example: 'Post contains inappropriate content' })
  reason?: string | null;

  @ApiPropertyOptional({ example: '45' })
  actorId?: string | null;

  @ApiPropertyOptional({ type: ActorDto })
  actor?: ActorDto | null;

  @ApiProperty({ example: '2025-10-11T13:05:12.000Z' })
  createdAt!: string;
}
