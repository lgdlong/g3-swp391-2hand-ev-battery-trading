import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseCreatePostDto } from '../base-create-post.dto';
import { PostType } from '../../../../shared/enums/post.enum';
import { CreateBikeDetailsDto } from '../../../post-details/dto/create-bike-details.dto';

export class CreateBikePostDto extends BaseCreatePostDto {
  postType: PostType = PostType.EV_BIKE;

  @ValidateNested()
  @Type(() => CreateBikeDetailsDto)
  bikeDetails!: CreateBikeDetailsDto;
}
