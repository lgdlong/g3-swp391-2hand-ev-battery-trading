import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { AccountRole } from '../../shared/enums/account-role.enum';
import { SafeAccountDto } from './dto/safe-account.dto';
import { CreateAccountResponseDto } from './dto/create-account-response.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiBadRequestResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { CurrentUser, ReqUser } from 'src/core/decorators/current-user.decorator';

@ApiBearerAuth()
@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin tài hiện tại (cần auth)'})
  @ApiOkResponse({ type: SafeAccountDto })
  async me(@CurrentUser() user: ReqUser): Promise<SafeAccountDto> {
    return this.accountsService.fineMe(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiOperation({ summary: 'Cập nhật tài khoản hiện tại (cần auth)'})
  @ApiBody({ type: UpdateAccountDto })
  @ApiOkResponse({ type: SafeAccountDto, description: 'Cập nhật thành công'})
  async updateMe(
    @CurrentUser() user: ReqUser,
    @Body() dto: UpdateAccountDto,
  ): Promise<SafeAccountDto>{
    return this.accountsService.updateMe(user.sub, dto)
  }

  @Post()
  @ApiOperation({ summary: 'Tạo tài khoản mới (public)' })
  @ApiBody({ type: CreateAccountDto })
  @ApiCreatedResponse({
    type: CreateAccountResponseDto,
    description: 'Tài khoản được tạo thành công',
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách account (public)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiOkResponse({ type: [SafeAccountDto] })
  findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<SafeAccountDto[]> {
    return this.accountsService.findAll(limit, offset);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Tìm account theo email (public)' })
  @ApiOkResponse({ type: SafeAccountDto })
  findByEmail(@Param('email') email: string) {
    return this.accountsService.findByEmail(email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin account theo id (public)' })
  @ApiOkResponse({ type: SafeAccountDto })
  findOne(@Param('id') id: string): Promise<SafeAccountDto> {
    return this.accountsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN, AccountRole.USER) // Users can update their own accounts
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật account theo id (cần auth)' })
  @ApiBody({ type: UpdateAccountDto })
  @ApiOkResponse({
    type: SafeAccountDto,
    description: 'Thông tin account đã được cập nhật',
  })
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.update(+id, updateAccountDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN) // Only admins can delete accounts
  @Delete(':id')
  @ApiOperation({ summary: 'Xoá account theo id (cần auth)' })
  @ApiNoContentResponse({ description: 'Xoá thành công' })
  remove(@Param('id') id: string) {
    return this.accountsService.remove(+id);
  }


}
