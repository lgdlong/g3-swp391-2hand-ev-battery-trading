import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for creating a new conversation
 * Contains the post ID for which the conversation is being initiated
 */
export class CreateConversationDto {
  @ApiProperty({
    description: 'ID of the post for which conversation is being created',
    example: '1',
  })
  @IsNotEmpty({ message: 'Post ID is required' })
  @IsString({ message: 'Post ID must be a string' })
  postId!: string;
}
