import { IsString, IsNotEmpty, IsUrl, IsInt, IsOptional, Min, MaxLength } from 'class-validator';

export class CreatePostImageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public_id!: string;

  @IsUrl()
  @IsNotEmpty()
  url!: string;

  @IsInt()
  @Min(1)
  width!: number;

  @IsInt()
  @Min(1)
  height!: number;

  @IsInt()
  @Min(0)
  bytes!: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  format?: string | null;
}
