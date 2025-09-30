import {
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumberString,
  IsString,
  IsArray,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PostType } from '../../../shared/enums/post.enum';
import { CreatePostImageDto } from './create-post-image.dto';

export class BaseCreatePostDto {
  @IsEnum(PostType)
  postType: PostType = PostType.EV_CAR; // cố định EV_CAR cho API này nếu không gán kiểu khác vào

  @IsString()
  @MaxLength(120)
  title!: string;

  @IsString()
  description!: string;

  // ---------------------------
  // Address fields
  // lưu mã hành chính thay vì tên để tránh việc địa danh thay đổi tên
  // và dễ dàng cho việc lọc, tìm kiếm theo vùng miền
  // ---------------------------
  @IsString()
  @MaxLength(10)
  wardCode!: string;

  @IsOptional()
  @IsString()
  provinceNameCached?: string;

  @IsOptional()
  @IsString()
  districtNameCached?: string;

  @IsOptional()
  @IsString()
  wardNameCached?: string;

  @IsOptional()
  @IsString()
  addressTextCached?: string;
  //---------------------------

  // Giá tiền ở VND
  // dùng numeric(14,0) nên gửi dạng string để không mất chính xác
  @IsNumberString()
  priceVnd!: string;

  // Có thể thương lượng hay không (Liên hệ)
  @IsOptional()
  @IsBoolean()
  isNegotiable?: boolean = false;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePostImageDto)
  images?: CreatePostImageDto[];
}
