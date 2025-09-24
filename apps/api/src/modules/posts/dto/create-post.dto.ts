import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PostType } from '../../../shared/enums/post-type.enum';

export class CreatePostDto {
  @IsEnum(PostType)
  postType!: PostType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @MaxLength(10)
  wardCode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  provinceNameCached?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  districtNameCached?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  wardNameCached?: string;

  @IsOptional()
  @IsString()
  addressTextCached?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceVnd!: number;

  @IsOptional()
  @IsBoolean()
  isNegotiable?: boolean;
}
