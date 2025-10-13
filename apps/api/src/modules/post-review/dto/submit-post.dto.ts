import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitPostDto {
  @ApiProperty({ example: '123', description: 'ID của bài đăng cần submit' })
  @IsString()
  @IsNotEmpty()
  postId!: string;
}
