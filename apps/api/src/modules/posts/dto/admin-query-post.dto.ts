import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { ListQueryDto } from '../../../shared/dto/list-query.dto';
import { PostStatus, PostType } from 'src/shared/enums/post.enum';

export class AdminListPostsQueryDto extends ListQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Số trang (bắt đầu từ 1). Sẽ được tự động chuyển đổi thành offset cho truy vấn.',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value, obj }: { value: unknown; obj: Record<string, unknown> }) => {
    const page = typeof value === 'number' ? value : Number(value) || 1;
    const limit = typeof obj.limit === 'number' ? obj.limit : 20;
    // map sang offset cho service nếu client dùng page
    obj.offset = obj.offset ?? (page - 1) * limit;
    return page;
  })
  page?: number = 1;

  @ApiPropertyOptional({
    example: '-createdAt',
    description: 'Sắp xếp theo trường. Dùng "-" ở đầu để DESC, không có để ASC',
    default: '-createdAt',
  })
  @IsOptional()
  @Transform(({ value, obj }: { value: unknown; obj: Record<string, unknown> }) => {
    const sort = typeof value === 'string' ? value : '-createdAt';
    // map sang order cho service; service đang order theo createdAt
    obj.order = obj.order ?? (sort.startsWith('-') ? 'DESC' : 'ASC');
    return sort;
  })
  sort?: string;

  @ApiPropertyOptional({
    example: 'PENDING_REVIEW',
    description: 'Lọc theo trạng thái bài đăng',
    enum: ['DRAFT', 'PENDING_REVIEW', 'REJECTED', 'PUBLISHED', 'PAUSED', 'SOLD', 'ARCHIVED'],
    enumName: 'PostStatus',
  })
  @IsOptional()
  status?: PostStatus;

  @ApiPropertyOptional({
    example: 'EV_CAR',
    description: 'Lọc theo loại bài đăng',
    enum: ['EV_CAR', 'EV_BIKE', 'BATTERY'],
    enumName: 'PostType',
  })
  @IsOptional()
  postType?: PostType;
}
