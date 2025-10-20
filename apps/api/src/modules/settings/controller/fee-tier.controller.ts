import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { FeeTierService } from '../service/fee-tier.service';
import { CreateFeeTierDto } from '../dto/fee-tier/create-fee-tier.dto';
import { UpdateFeeTierDto } from '../dto/fee-tier/update-fee-tier.dto';
import { FeeTierResponseDto } from '../dto/settings-response.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { AccountRole } from 'src/shared/enums/account-role.enum';

@ApiTags('Settings - Fee Tiers')
@Controller('settings/fee-tiers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FeeTierController {
  constructor(private readonly feeTierService: FeeTierService) {}

  @Post()
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Create a new fee tier' })
  @ApiResponse({
    status: 201,
    description: 'Fee tier created successfully',
    type: FeeTierResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  create(@Body() createFeeTierDto: CreateFeeTierDto) {
    return this.feeTierService.create(createFeeTierDto);
  }

  @Get()
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Get all fee tiers' })
  @ApiResponse({
    status: 200,
    description: 'Fee tiers retrieved successfully',
    type: [FeeTierResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  findAll() {
    return this.feeTierService.findAll();
  }

  @Get(':id')
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Get a fee tier by ID' })
  @ApiParam({ name: 'id', description: 'Fee tier ID' })
  @ApiResponse({
    status: 200,
    description: 'Fee tier retrieved successfully',
    type: FeeTierResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Fee tier not found' })
  findOne(@Param('id') id: number) {
    return this.feeTierService.findOne(+id);
  }

  @Put(':id')
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Update a fee tier' })
  @ApiParam({ name: 'id', description: 'Fee tier ID' })
  @ApiResponse({
    status: 200,
    description: 'Fee tier updated successfully',
    type: FeeTierResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Fee tier not found' })
  update(@Param('id') id: number, @Body() updateFeeTierDto: UpdateFeeTierDto) {
    return this.feeTierService.update(+id, updateFeeTierDto);
  }

  @Delete(':id')
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Delete a fee tier' })
  @ApiParam({ name: 'id', description: 'Fee tier ID' })
  @ApiResponse({ status: 200, description: 'Fee tier deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Fee tier not found' })
  remove(@Param('id') id: number) {
    return this.feeTierService.remove(+id);
  }
}
