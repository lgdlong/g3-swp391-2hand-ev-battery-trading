import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class RejectPostDto {
  @ApiProperty({ example: '123', description: 'ID của bài đăng cần reject' })
  @IsString()
  @IsNotEmpty()
  postId!: string;

  @ApiProperty({ example: 'Thiếu giấy tờ', description: 'Lý do reject (bắt buộc)' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}