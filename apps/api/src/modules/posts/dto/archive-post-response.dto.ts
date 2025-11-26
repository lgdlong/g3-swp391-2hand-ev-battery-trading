import { ApiProperty } from '@nestjs/swagger';
import { PostStatus } from '../../../shared/enums/post.enum';

export class ArchivePostResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: '123' })
  postId!: string;

  @ApiProperty({ enum: PostStatus, enumName: 'PostStatus', example: 'ARCHIVED' })
  newStatus!: PostStatus;

  @ApiProperty({
    example: 'Bài viết đã được thu hồi. Yêu cầu hoàn phí (nếu đủ điều kiện) sẽ được xử lý tự động.',
  })
  message!: string;
}
