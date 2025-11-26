import { ApiProperty } from '@nestjs/swagger';
import { ReviewActionEnum } from '../../../shared/enums/review.enum';
import { PostStatus } from '../../../shared/enums/post.enum';
import { IsDateString, IsEnum, IsString } from 'class-validator';

export class PostReviewLogDto {
  @ApiProperty({ example: '101' })
  @IsString()
  id!: string;

  @ApiProperty({ example: '123' })
  @IsString()
  postId!: string;

  @ApiProperty({ enum: ReviewActionEnum, enumName: 'ReviewActionEnum', example: 'REJECTED' })
  @IsEnum(ReviewActionEnum)
  action!: ReviewActionEnum;

  @ApiProperty({
    enum: PostStatus,
    enumName: 'PostStatus',
    nullable: true,
    example: 'PENDING_REVIEW',
  })
  @IsEnum(PostStatus)
  oldStatus!: PostStatus | null;

  @ApiProperty({ enum: PostStatus, enumName: 'PostStatus', nullable: true, example: 'PUBLISHED' })
  newStatus!: PostStatus | null;

  @ApiProperty({ nullable: true, example: 'SPAM' })
  @IsString()
  reason!: string | null;

  @ApiProperty({ nullable: true, example: '45' })
  actorId!: string | null;

  @ApiProperty({ example: '2025-10-11T13:05:12.000Z' })
  @IsDateString()
  createdAt!: string;
}
