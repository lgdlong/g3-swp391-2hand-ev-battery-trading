import {
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumberString,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostType, PostStatus } from '../../../shared/enums/post.enum';

export class BaseCreatePostDto {
  @ApiProperty({
    enum: PostType,
    description: 'Loại bài đăng (EV_CAR hoặc EV_BIKE)',
    example: PostType.EV_CAR,
  })
  @IsEnum(PostType)
  postType: PostType = PostType.EV_CAR; // cố định EV_CAR cho API này nếu không gán kiểu khác vào

  @ApiPropertyOptional({
    enum: PostStatus,
    enumName: 'PostStatus',
    description:
      'Trạng thái bài đăng - mặc định là PENDING_REVIEW để gửi duyệt, có thể chọn DRAFT để lưu nháp',
    example: 'PENDING_REVIEW',
    default: 'PENDING_REVIEW',
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus = PostStatus.PENDING_REVIEW;

  @ApiProperty({
    description: 'Tiêu đề bài đăng',
    example: 'Bán xe VinFast VF e34 đời 2023',
    maxLength: 120,
  })
  @IsString()
  @MaxLength(120)
  title!: string;

  @ApiProperty({
    description: 'Mô tả chi tiết về sản phẩm',
    example: 'Xe còn mới, pin còn tốt 85%, đi được khoảng 300km/lần sạc',
  })
  @IsString()
  description!: string;

  // ---------------------------
  // Address fields
  // lưu mã hành chính thay vì tên để tránh việc địa danh thay đổi tên
  // và dễ dàng cho việc lọc, tìm kiếm theo vùng miền
  // ---------------------------
  @ApiProperty({
    description: 'Mã phường/xã theo chuẩn hành chính',
    example: '00001',
    maxLength: 10,
  })
  @IsString()
  @MaxLength(10)
  wardCode!: string;

  @ApiPropertyOptional({
    description: 'Tên tỉnh/thành phố (cache để hiển thị)',
    example: 'Hà Nội',
  })
  @IsOptional()
  @IsString()
  provinceNameCached?: string;

  @ApiPropertyOptional({
    description: 'Tên quận/huyện (cache để hiển thị)',
    example: 'Quận Ba Đình',
  })
  @IsOptional()
  @IsString()
  districtNameCached?: string;

  @ApiPropertyOptional({
    description: 'Tên phường/xã (cache để hiển thị)',
    example: 'Phường Phúc Xá',
  })
  @IsOptional()
  @IsString()
  wardNameCached?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ chi tiết (cache để hiển thị)',
    example: 'Số 123 Đường ABC',
  })
  @IsOptional()
  @IsString()
  addressTextCached?: string;
  //---------------------------

  // Giá tiền ở VND
  // dùng numeric(14,0) nên gửi dạng string để không mất chính xác
  @ApiProperty({
    description: 'Giá bán (VND) - gửi dạng string để tránh mất độ chính xác',
    example: '500000000',
  })
  @IsNumberString()
  priceVnd!: string;

  // Có thể thương lượng hay không (Liên hệ)
  @ApiPropertyOptional({
    description: 'Có thể thương lượng giá hay không',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isNegotiable?: boolean;

  // @ApiPropertyOptional({
  //   description: 'Danh sách hình ảnh của bài đăng',
  //   type: [CreatePostImageDto],
  // })
  // @IsOptional()
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => CreatePostImageDto)
  // images?: CreatePostImageDto[];
}
