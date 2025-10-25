import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ServiceTypesService } from './service-types.service';
import { CreateServiceTypeDto, UpdateServiceTypeDto, ServiceTypeResponseDto } from './dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { AccountRole } from '../../shared/enums/account-role.enum';

@ApiTags('Service Types')
@Controller('service-types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ServiceTypesController {
  constructor(private readonly serviceTypesService: ServiceTypesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Create a new service type (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Service type created successfully',
    type: ServiceTypeResponseDto,
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Service type code already exists' })
  async create(
    @Body() createServiceTypeDto: CreateServiceTypeDto,
  ): Promise<ServiceTypeResponseDto> {
    return this.serviceTypesService.create(createServiceTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all service types' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service types retrieved successfully',
    type: [ServiceTypeResponseDto],
  })
  async findAll(): Promise<ServiceTypeResponseDto[]> {
    return this.serviceTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service type by ID' })
  @ApiParam({ name: 'id', description: 'Service type ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service type retrieved successfully',
    type: ServiceTypeResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Service type not found' })
  async findOne(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) id: number,
  ): Promise<ServiceTypeResponseDto> {
    return this.serviceTypesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Update service type (Admin only)' })
  @ApiParam({ name: 'id', description: 'Service type ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service type updated successfully',
    type: ServiceTypeResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Service type not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Service type code already exists' })
  async update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) id: number,
    @Body() updateServiceTypeDto: UpdateServiceTypeDto,
  ): Promise<ServiceTypeResponseDto> {
    return this.serviceTypesService.update(id, updateServiceTypeDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Delete service type (Admin only)' })
  @ApiParam({ name: 'id', description: 'Service type ID', type: Number })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Service type deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Service type not found' })
  async remove(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) id: number,
  ): Promise<void> {
    return this.serviceTypesService.remove(id);
  }

  @Patch(':id/toggle-active')
  @UseGuards(RolesGuard)
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Toggle service type active status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Service type ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service type status toggled successfully',
    type: ServiceTypeResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Service type not found' })
  async toggleActive(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) id: number,
  ): Promise<ServiceTypeResponseDto> {
    return this.serviceTypesService.toggleActive(id);
  }
}
