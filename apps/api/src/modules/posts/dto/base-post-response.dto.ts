// apps/api/src/modules/posts/dto/post-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PostStatus, PostType } from '../../../shared/enums/post.enum';
import { SafeAccountDto } from '../../accounts/dto/safe-account.dto';
import { CarDetailsResponseDto } from '../../post-details/dto/car/car-details-response.dto';
import { BikeDetailsResponseDto } from '../../post-details/dto/bike/bike-details-response.dto';
import { PostImageResponseDto } from './post-image-response.dto';
import { BatteryDetailResponseDto } from 'src/modules/post-details/dto/battery/battery-detail-response.dto';

export class BasePostResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: PostType })
  postType!: PostType;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  wardCode!: string;

  @ApiProperty({ nullable: true })
  provinceNameCached: string | null = null;

  @ApiProperty({ nullable: true })
  districtNameCached: string | null = null;

  @ApiProperty({ nullable: true })
  wardNameCached: string | null = null;

  @ApiProperty({ nullable: true })
  addressTextCached: string | null = null;

  @ApiProperty()
  priceVnd!: string;

  @ApiProperty()
  isNegotiable!: boolean;

  @ApiProperty({ enum: PostStatus, enumName: 'PostStatus', example: 'PUBLISHED' })
  status!: PostStatus;

  @ApiProperty({ nullable: true })
  submittedAt: Date | null = null;

  @ApiProperty({ nullable: true })
  reviewedAt: Date | null = null;

  @ApiProperty({ type: SafeAccountDto })
  @Type(() => SafeAccountDto)
  seller!: SafeAccountDto;

  @ApiProperty({ type: () => CarDetailsResponseDto, required: false })
  @Type(() => CarDetailsResponseDto)
  carDetails?: CarDetailsResponseDto;

  @ApiProperty({ type: () => BikeDetailsResponseDto, required: false })
  @Type(() => BikeDetailsResponseDto)
  bikeDetails?: BikeDetailsResponseDto;

  @ApiProperty({ type: () => BatteryDetailResponseDto, required: false })
  @Type(() => BatteryDetailResponseDto)
  batteryDetails?: BatteryDetailResponseDto;

  @ApiProperty({ type: () => [PostImageResponseDto], required: false })
  @Type(() => PostImageResponseDto)
  images?: PostImageResponseDto[];

  @ApiProperty({
    type: Number,
    description: 'Số lượng giấy tờ xe đã được người bán tải lên để phục vụ kiểm duyệt',
    example: 2,
    required: false,
  })
  documentsCount: number = 0;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
