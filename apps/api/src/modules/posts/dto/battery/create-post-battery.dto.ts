import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseCreatePostDto } from '../base-create-post.dto';
import { PostType } from '../../../../shared/enums/post.enum';
import { CreateBatteryDetailsDto } from '../../../post-details/dto/battery/create-battery-details.dto';

@ApiExtraModels(CreateBatteryDetailsDto)
export class CreateBatteryPostDto extends BaseCreatePostDto {
  @ApiProperty({
    enum: PostType,
    default: PostType.BATTERY,
    description: 'Loại bài đăng. Endpoint này cố định là BATTERY.',
  })
  postType: PostType = PostType.BATTERY;

  @ApiProperty({
    type: () => CreateBatteryDetailsDto,
    description: 'Thông tin chi tiết của pin.',
  })
  @ValidateNested()
  @Type(() => CreateBatteryDetailsDto)
  batteryDetails!: CreateBatteryDetailsDto;
}
