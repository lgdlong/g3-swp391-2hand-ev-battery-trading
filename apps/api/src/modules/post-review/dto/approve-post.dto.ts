import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class ApprovePostDto {
  @IsString()
  @IsNotEmpty()
  postId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}