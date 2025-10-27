import { AccountRole } from '../../../shared/enums/account-role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class SummaryAccountDto {
  @ApiProperty({ example: 123, description: 'ID của tài khoản' })
  id!: number;

  @ApiProperty({
    example: 'alice@example.com',
    nullable: true,
    description: 'Email đăng nhập, có thể null nếu đăng ký bằng phone',
  })
  email?: string;

  @ApiProperty({
    example: '+84901234567',
    nullable: true,
    description: 'Số điện thoại đăng nhập, có thể null nếu đăng ký bằng email',
  })
  phone?: string;

  @ApiProperty({ example: 'Alice Nguyen', description: 'Tên đầy đủ' })
  fullName?: string;

  @ApiProperty({
    enum: AccountRole,
    example: AccountRole.USER,
    description: 'Vai trò của account (USER / ADMIN)',
  })
  role!: AccountRole;
  status!: string;

  @ApiProperty({
    example: '2025-09-17T01:23:45.000Z',
    description: 'Ngày tạo tài khoản (ISO 8601)',
  })
  createdAt!: string;
}
