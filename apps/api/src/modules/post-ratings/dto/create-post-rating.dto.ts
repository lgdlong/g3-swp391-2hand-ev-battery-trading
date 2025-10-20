import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePostRatingDto {
    @ApiProperty({
        description: 'Rating score for the post',
        minimum: 0,
        maximum: 5,
        example: 4,
        type: 'integer'
    })
    @IsInt()
    @Min(0)
    @Max(5)
    rating!: number;

    @ApiPropertyOptional({
        description: 'Optional review content/comment',
        maxLength: 1000,
        example: 'Great battery condition, exactly as described!'
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    content!: string;
}
