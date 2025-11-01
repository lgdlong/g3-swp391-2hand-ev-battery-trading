import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PostLifecycleService } from '../service/post-lifecycle.service';
import { CreatePostLifecycleDto } from '../dto/post-lifecycle/create-post-lifecycle.dto';
import { UpdatePostLifecycleDto } from '../dto/post-lifecycle/update-post-lifecycle.dto';
import { PostLifecycleResponseDto } from '../dto/settings-response.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { AccountRole } from 'src/shared/enums/account-role.enum';

@ApiTags('Settings - Post Lifecycle')
@Controller('settings/post-lifecycle')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PostLifecycleController {
  constructor(private readonly postLifecycleService: PostLifecycleService) {}

  @Post()
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Create a new post lifecycle configuration' })
  @ApiResponse({
    status: 201,
    description: 'Post lifecycle configuration created successfully',
    type: PostLifecycleResponseDto,
  })
  create(@Body() createPostLifecycleDto: CreatePostLifecycleDto) {
    return this.postLifecycleService.create(createPostLifecycleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all post lifecycle configurations' })
  @ApiResponse({
    status: 200,
    description: 'Post lifecycle configurations retrieved successfully',
    type: [PostLifecycleResponseDto],
  })
  findAll() {
    return this.postLifecycleService.findAll();
  }

  @Get(':id')
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Get a post lifecycle configuration by ID' })
  @ApiParam({ name: 'id', description: 'Post lifecycle configuration ID' })
  @ApiResponse({
    status: 200,
    description: 'Post lifecycle configuration retrieved successfully',
    type: PostLifecycleResponseDto,
  })
  findOne(@Param('id') id: number) {
    return this.postLifecycleService.findOne(+id);
  }

  @Put(':id')
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Update a post lifecycle configuration' })
  @ApiParam({ name: 'id', description: 'Post lifecycle configuration ID' })
  @ApiResponse({
    status: 200,
    description: 'Post lifecycle configuration updated successfully',
    type: PostLifecycleResponseDto,
  })
  update(@Param('id') id: number, @Body() updatePostLifecycleDto: UpdatePostLifecycleDto) {
    return this.postLifecycleService.update(+id, updatePostLifecycleDto);
  }

  @Delete(':id')
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Delete a post lifecycle configuration' })
  @ApiParam({ name: 'id', description: 'Post lifecycle configuration ID' })
  @ApiResponse({ status: 200, description: 'Post lifecycle configuration deleted successfully' })
  remove(@Param('id') id: number) {
    return this.postLifecycleService.remove(+id);
  }
}
