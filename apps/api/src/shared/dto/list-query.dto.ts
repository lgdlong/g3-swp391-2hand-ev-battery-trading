import { IsIn, IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListQueryDto {
  @IsOptional()
  @IsString()
  q?: string; // nội dung tìm kiếm

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0; // vị trí bắt đầu lấy danh sách

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 50; // số lượng bản ghi muốn lấy

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'ASC'; // sắp xếp tăng dần hoặc giảm dần
}
