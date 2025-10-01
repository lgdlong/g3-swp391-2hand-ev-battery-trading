import { IsNumber } from "class-validator";

export class CreatePostBookmarkDto {
    @IsNumber()
    postId!: number;
}
