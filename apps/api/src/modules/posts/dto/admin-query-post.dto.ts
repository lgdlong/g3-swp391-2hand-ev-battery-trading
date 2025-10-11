import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ListQueryDto } from '../../../shared/dto/list-query.dto';

export class AdminListPostsQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value, obj }) => {
    const page = Number(value) || 1;
    const limit = Number(obj.limit ?? 20);
    // map sang offset cho service nếu client dùng page
    obj.offset = obj.offset ?? (page - 1) * limit;
    return page;
  })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  @Transform(({ value }) => Number(value))
  // kế thừa limit từ ListQueryDto, giữ nguyên
  declare limit: number;

  @ApiPropertyOptional({ example: 'vinfast' })
  @IsOptional()
  @IsString()
  declare q?: string;

  @ApiPropertyOptional({
    example: '-createdAt',
    description: "Dùng '-createdAt' để DESC, 'createdAt' để ASC",
  })
  @IsOptional()
  @Transform(({ value, obj }) => {
    const sort = (value ?? '-createdAt').toString();
    // map sang order cho service; service đang order theo createdAt
    obj.order = obj.order ?? (sort.startsWith('-') ? 'DESC' : 'ASC');
    return sort;
  })
  sort?: string;

  @ApiPropertyOptional({ example: 'PENDING_REVIEW' })
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'EV_CAR' })
  @IsOptional()
  postType?: string;
}