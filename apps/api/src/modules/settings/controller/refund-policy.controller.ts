import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RefundPolicyService } from '../service/refund-policy.service';
import { CreateRefundPolicyDto } from '../dto/refund-policy/create-refund-policy.dto';
import { UpdateRefundPolicyDto } from '../dto/refund-policy/update-refund-policy.dto';
import { RefundPolicyResponseDto } from '../dto/settings-response.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { AccountRole } from 'src/shared/enums/account-role.enum';

@ApiTags('Settings - Refund Policies')
@Controller('settings/refund-policies')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RefundPolicyController {
  constructor(private readonly refundPolicyService: RefundPolicyService) {}

  @Post()
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Create a new refund policy' })
  @ApiResponse({
    status: 201,
    description: 'Refund policy created successfully',
    type: RefundPolicyResponseDto,
  })
  create(@Body() createRefundPolicyDto: CreateRefundPolicyDto) {
    return this.refundPolicyService.create(createRefundPolicyDto);
  }

  @Get()
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Get all refund policies' })
  @ApiResponse({
    status: 200,
    description: 'Refund policies retrieved successfully',
    type: [RefundPolicyResponseDto],
  })
  findAll() {
    return this.refundPolicyService.findAll();
  }

  @Get(':id')
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Get a refund policy by ID' })
  @ApiParam({ name: 'id', description: 'Refund policy ID' })
  @ApiResponse({
    status: 200,
    description: 'Refund policy retrieved successfully',
    type: RefundPolicyResponseDto,
  })
  findOne(@Param('id') id: number) {
    return this.refundPolicyService.findOne(+id);
  }

  @Put(':id')
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Update a refund policy' })
  @ApiParam({ name: 'id', description: 'Refund policy ID' })
  @ApiResponse({
    status: 200,
    description: 'Refund policy updated successfully',
    type: RefundPolicyResponseDto,
  })
  update(@Param('id') id: number, @Body() updateRefundPolicyDto: UpdateRefundPolicyDto) {
    return this.refundPolicyService.update(+id, updateRefundPolicyDto);
  }

  @Delete(':id')
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Delete a refund policy' })
  @ApiParam({ name: 'id', description: 'Refund policy ID' })
  @ApiResponse({ status: 200, description: 'Refund policy deleted successfully' })
  remove(@Param('id') id: number) {
    return this.refundPolicyService.remove(+id);
  }
}
