import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateFlagDto {
  @ApiProperty({ example: '123', description: 'ID của bài viết bị gắn cờ' })
  @IsString()
  @IsNotEmpty()
  postId: string;

  @ApiProperty({
    example: 'Nghi ngờ giá quá thấp so với thị trường',
    description: 'Lý do gắn cờ',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    example: '1',
    description: 'ID của admin gắn cờ (null nếu là hệ thống)',
    required: false,
  })
  @IsOptional()
  @IsString()
  flaggedBy?: string | null;
}
