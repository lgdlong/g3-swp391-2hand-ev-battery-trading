import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PostStatus } from "src/shared/enums/post.enum";
import { ReviewActionEnum } from "src/shared/enums/review.enum";

export class CreateReviewLogDto {
  @IsString()
  @IsNotEmpty()
  postId!: string;

  @IsOptional()
  @IsString()
  actorId?: string;

  @IsEnum(PostStatus)
  @IsOptional()
  oldStatus?: PostStatus;

  @IsEnum(PostStatus)
  @IsOptional()
  newStatus?: PostStatus;

  @IsEnum(ReviewActionEnum)
  action!: ReviewActionEnum;

  @IsOptional()
  @IsString()
  reason?: string;
}