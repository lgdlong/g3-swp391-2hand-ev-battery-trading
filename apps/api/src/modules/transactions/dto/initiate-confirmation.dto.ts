import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for seller to initiate contract confirmation flow
 */
export class InitiateConfirmationDto {
  @ApiProperty({
    description: 'ID of the post/listing',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  listingId!: string;

  @ApiProperty({
    description: 'ID of the conversation with the buyer',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  conversationId!: number;
}
