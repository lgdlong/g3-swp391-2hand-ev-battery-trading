import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ListQueryDto } from '../../../shared/dto/list-query.dto';
import { PostStatus } from '../../../shared/enums/post.enum';

export class PostsQueryDto extends ListQueryDto {
  @ApiPropertyOptional({
    description: 'Trạng thái bài đăng',
    enum: PostStatus,
    example: PostStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({
    description: 'Số trang (bắt đầu từ 1)',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Trường sắp xếp',
    enum: ['createdAt', 'updatedAt', 'priceVnd', 'title'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'priceVnd', 'title'])
  sort?: 'createdAt' | 'updatedAt' | 'priceVnd' | 'title' = 'createdAt';
}
