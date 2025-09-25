import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseCreatePostDto } from '../base-create-post.dto';
import { PostType } from '../../../../shared/enums/post.enum';
import { CreateCarDetailsDto } from '../../../post-details/dto/car/create-car-details.dto';

export class CreateCarPostDto extends BaseCreatePostDto {
  postType: PostType = PostType.EV_CAR;

  @ValidateNested()
  @Type(() => CreateCarDetailsDto)
  carDetails!: CreateCarDetailsDto;
}
