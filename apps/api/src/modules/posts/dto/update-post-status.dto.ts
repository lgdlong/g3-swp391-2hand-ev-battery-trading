import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PostStatus } from '../../../shared/enums/post.enum';

export class UpdatePostStatusDto {
  @ApiProperty({
    enum: PostStatus,
    description: 'Trạng thái mới của bài đăng',
    example: PostStatus.PENDING_REVIEW,
  })
  @IsEnum(PostStatus)
  status!: PostStatus;
}
