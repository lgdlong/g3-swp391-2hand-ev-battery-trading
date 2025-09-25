import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseCreatePostDto } from '../base-create-post.dto';
import { PostType } from '../../../../shared/enums/post.enum';
import { CreateCarDetailsDto } from '../../../post-details/dto/car/create-car-details.dto';

@ApiExtraModels(CreateCarDetailsDto)
export class CreateCarPostDto extends BaseCreatePostDto {
  @ApiProperty({
    enum: PostType,
    default: PostType.EV_CAR,
    description: 'Loại bài đăng. Endpoint này cố định là EV_CAR.',
  })
  postType: PostType = PostType.EV_CAR;

  @ApiProperty({
    type: () => CreateCarDetailsDto,
    description: 'Thông tin chi tiết của ô tô điện.',
  })
  @ValidateNested()
  @Type(() => CreateCarDetailsDto)
  carDetails!: CreateCarDetailsDto;
}
