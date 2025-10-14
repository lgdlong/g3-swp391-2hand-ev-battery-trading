import { ApiProperty } from '@nestjs/swagger';

export class DeletePostResponseDto {
  @ApiProperty({
    example: 'Post has been soft deleted',
    description: 'Message confirming that the post was soft deleted successfully',
  })
  message!: string;

  @ApiProperty({
    example: '2025-10-15T08:00:00.000Z',
    description: 'Timestamp indicating when the post was soft deleted',
  })
  deletedAt!: string;
}
