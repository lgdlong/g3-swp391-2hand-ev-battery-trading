import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseCreatePostDto } from '../base-create-post.dto';
import { PostType } from '../../../../shared/enums/post.enum';
import { CreateBikeDetailsDto } from '../../../post-details/dto/bike/create-bike-details.dto';

@ApiExtraModels(CreateBikeDetailsDto)
export class CreateBikePostDto extends BaseCreatePostDto {
  @ApiProperty({
    enum: PostType,
    default: PostType.EV_BIKE,
    description: 'Loại bài đăng. Endpoint này cố định là EV_BIKE.',
  })
  postType: PostType = PostType.EV_BIKE;

  @ApiProperty({
    type: () => CreateBikeDetailsDto,
    description: 'Thông tin chi tiết của xe máy/xe đạp điện.',
  })
  @ValidateNested()
  @Type(() => CreateBikeDetailsDto)
  bikeDetails!: CreateBikeDetailsDto;
}
