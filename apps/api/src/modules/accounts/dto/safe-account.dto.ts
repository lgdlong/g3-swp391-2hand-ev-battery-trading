import { ApiProperty } from '@nestjs/swagger';
import { AccountRole } from '../../../shared/enums/account-role.enum';
import { AccountStatus } from '../../../shared/enums/account-status.enum';

export class SafeAccountDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'alice@example.com', nullable: true })
  email!: string | null;

  @ApiProperty({ example: '+84901234567', nullable: true })
  phone!: string | null;

  @ApiProperty({ example: 'Alice Nguyen' })
  fullName!: string;

  @ApiProperty({
    example: 'https://cdn.example.com/avatar/alice.png',
    nullable: true,
  })
  avatarUrl!: string | null;

  @ApiProperty({ enum: AccountStatus, example: AccountStatus.ACTIVE })
  status!: AccountStatus;

  @ApiProperty({ enum: AccountRole, example: AccountRole.USER })
  role!: AccountRole;

  @ApiProperty({
    example: '2025-09-17T01:23:45.000Z',
    description: 'Ngày tạo',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2025-09-17T01:23:45.000Z',
    description: 'Ngày cập nhật',
  })
  updatedAt!: Date;
}
