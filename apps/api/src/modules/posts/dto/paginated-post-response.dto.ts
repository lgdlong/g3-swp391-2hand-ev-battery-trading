import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BasePostResponseDto } from './base-post-response.dto';

export class PaginatedBasePostResponseDto {
  @ApiProperty({ type: [BasePostResponseDto] })
  @Type(() => BasePostResponseDto)
  data!: BasePostResponseDto[];

  @ApiProperty({ example: 100, description: 'Tổng số bài đăng' })
  total!: number;

  @ApiProperty({ example: 1, description: 'Trang hiện tại' })
  page!: number;

  @ApiProperty({ example: 20, description: 'Số lượng item trên 1 trang' })
  limit!: number;

  @ApiProperty({ example: 5, description: 'Tổng số trang' })
  totalPages!: number;
}