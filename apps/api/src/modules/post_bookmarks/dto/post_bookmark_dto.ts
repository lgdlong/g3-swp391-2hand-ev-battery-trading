import { ApiProperty } from '@nestjs/swagger';

export class PostBookmarkDto {
  @ApiProperty({ 
    description: 'Unique identifier for the bookmark',
    example: 1 
  })
  id!: number;

  @ApiProperty({ 
    description: 'ID of the account that owns this bookmark',
    example: 123 
  })
  accountId!: number;

  @ApiProperty({ 
    description: 'ID of the bookmarked post',
    example: 456 
  })
  postId!: number;

  @ApiProperty({ 
    description: 'Timestamp when the bookmark was created (ISO string)',
    example: '2025-10-02T10:30:00.000Z'
  })
  createdAt!: Date;
}
