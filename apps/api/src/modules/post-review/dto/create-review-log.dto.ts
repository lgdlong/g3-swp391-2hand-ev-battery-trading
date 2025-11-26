import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostStatus } from 'src/shared/enums/post.enum';
import { ReviewActionEnum } from 'src/shared/enums/review.enum';

export class CreateReviewLogDto {
  @ApiProperty({ example: '123', description: 'ID của bài đăng' })
  @IsString()
  @IsNotEmpty()
  postId!: string;

  @ApiPropertyOptional({ example: '45', description: 'ID của người thực hiện action' })
  @IsOptional()
  @IsString()
  actorId?: string;

  @ApiPropertyOptional({ enum: PostStatus, enumName: 'PostStatus', description: 'Trạng thái cũ' })
  @IsEnum(PostStatus)
  @IsOptional()
  oldStatus?: PostStatus;

  @ApiPropertyOptional({ enum: PostStatus, enumName: 'PostStatus', description: 'Trạng thái mới' })
  @IsEnum(PostStatus)
  @IsOptional()
  newStatus?: PostStatus;

  @ApiProperty({
    enum: ReviewActionEnum,
    enumName: 'ReviewActionEnum',
    description: 'Hành động review',
  })
  @IsEnum(ReviewActionEnum)
  action!: ReviewActionEnum;

  @ApiPropertyOptional({ example: 'Thiếu giấy tờ', description: 'Lý do (nếu có)' })
  @IsOptional()
  @IsString()
  reason?: string;
}
