import {
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumberString,
  IsString,
  IsArray,
  ValidateNested,
  IsInt,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PostType } from '../../../shared/enums/post.enum';
import { CreateCarDetailsDto } from './create-car-details.dto';
import { CreateMediaDto } from './create-media.dto';

export class CreatePostDto {
  // nếu lấy từ auth, bỏ field này đi
  @IsInt()
  sellerId!: number;

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

  @ValidateNested()
  @Type(() => CreateCarDetailsDto)
  details!: CreateCarDetailsDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMediaDto)
  media?: CreateMediaDto[];
}
