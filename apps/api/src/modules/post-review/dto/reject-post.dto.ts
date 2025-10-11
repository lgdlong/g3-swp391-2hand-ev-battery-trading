import { IsNotEmpty, IsString } from "class-validator";

export class RejectPostDto {
  @IsString()
  @IsNotEmpty()
  postId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}