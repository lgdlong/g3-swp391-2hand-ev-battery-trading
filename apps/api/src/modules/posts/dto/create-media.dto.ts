import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { MediaKind } from '../../../shared/enums/media.enum';

export class CreateMediaDto {
  @IsEnum(MediaKind)
  kind!: MediaKind;

  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number = 0;
}
