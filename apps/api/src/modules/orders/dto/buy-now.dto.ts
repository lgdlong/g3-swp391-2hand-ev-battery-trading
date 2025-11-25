import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class BuyNowDto {
  @ApiProperty({ example: '123', description: 'ID của bài đăng cần mua' })
  @IsString()
  @IsNotEmpty()
  postId!: string;

  @ApiPropertyOptional({ example: 'Giao hàng buổi sáng', description: 'Ghi chú đơn hàng' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
