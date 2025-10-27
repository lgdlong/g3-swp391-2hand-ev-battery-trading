import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PostRatingResponseDto {
    @ApiProperty({
        description: 'Rating ID',
        example: '123'
    })
    id!: string;

    @ApiProperty({
        description: 'Rating score',
        minimum: 0,
        maximum: 5,
        example: 4
    })
    rating!: number;

    @ApiPropertyOptional({
        description: 'Review content',
        example: 'Great battery condition, exactly as described!'
    })
    content?: string;

    @ApiProperty({
        description: 'Post ID that was rated',
        example: '456'
    })
    postId!: string;

    @ApiProperty({
        description: 'User ID who created the rating',
        example: '789'
    })
    userId!: number;

    @ApiProperty({
        description: 'Rating creation date',
        example: '2024-01-15T10:30:00Z'
    })
    createdAt!: Date;

    @ApiProperty({
        description: 'Rating last update date',
        example: '2024-01-15T10:30:00Z'
    })
    updatedAt!: Date;
}

export class PostRatingListResponseDto {
    @ApiProperty({
        type: [PostRatingResponseDto],
        description: 'List of ratings'
    })
    data!: PostRatingResponseDto[];

    @ApiProperty({
        description: 'Total number of ratings',
        example: 150
    })
    total!: number;

    @ApiProperty({
        description: 'Current page number',
        example: 1
    })
    page!: number;

    @ApiProperty({
        description: 'Items per page',
        example: 20
    })
    limit!: number;

    @ApiProperty({
        description: 'Total number of pages',
        example: 8
    })
    totalPages!: number;
}