import { ApiProperty } from '@nestjs/swagger';
import { ReviewActionEnum } from '../../../shared/enums/review.enum';
import { PostStatus } from '../../../shared/enums/post.enum';

export class PostReviewLogDto {
  @ApiProperty({ example: '101' })
  id!: string;

  @ApiProperty({ example: '123' })
  postId!: string;

  @ApiProperty({ enum: ReviewActionEnum, example: ReviewActionEnum.REJECTED })
  action!: ReviewActionEnum;

  @ApiProperty({ enum: PostStatus, nullable: true, example: PostStatus.PENDING_REVIEW })
  oldStatus!: PostStatus | null;

  @ApiProperty({ enum: PostStatus, nullable: true, example: PostStatus.PUBLISHED })
  newStatus!: PostStatus | null;

  @ApiProperty({ nullable: true, example: 'Thiếu giấy tờ' })
  reason!: string | null;

  @ApiProperty({ nullable: true, example: 45 })
  actorId!: number | null;

  @ApiProperty({ example: '2025-10-11T13:05:12.000Z' })
  createdAt!: string;
}
