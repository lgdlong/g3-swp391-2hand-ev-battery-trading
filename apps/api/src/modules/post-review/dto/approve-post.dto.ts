import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApprovePostDto {
  @ApiProperty({ example: '123', description: 'ID của bài đăng cần approve' })
  @IsString()
  @IsNotEmpty()
  postId!: string;

  @ApiPropertyOptional({ example: 'Bài đăng hợp lệ', description: 'Lý do approve (tùy chọn)' })
  @IsOptional()
  @IsString()
  reason?: string;
}
