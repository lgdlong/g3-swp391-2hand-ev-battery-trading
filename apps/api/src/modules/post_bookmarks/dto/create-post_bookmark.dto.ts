import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

import { IsNumber, IsPositive } from "class-validator";

export class CreatePostBookmarkDto {
    @IsNumber()
    @IsPositive()
    @ApiProperty({ 
        description: 'ID of the post to bookmark',
        example: 42,
        minimum: 1
    })
    @Type(() => Number) 
    postId!: number;
}
