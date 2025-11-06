import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PostFraudFlagsService } from './post-fraud-flags.service';
import { CreateFlagDto } from './dto/create-flag.dto';
import { UpdateFlagStatusDto } from './dto/update-flag-status.dto';
import { FlagResponseDto, PaginatedFlaggedPostsResponseDto } from './dto/flag-response.dto';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { AccountRole } from 'src/shared/enums/account-role.enum';
import { Roles } from 'src/core/decorators/roles.decorator';

@ApiTags('Post Fraud Flags')
@ApiBearerAuth()
@Controller('post-fraud-flags')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostFraudFlagsController {
  constructor(private readonly postFraudFlagsService: PostFraudFlagsService) {}

  @Post()
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Gắn cờ gian lận cho bài viết (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Flag created successfully',
    type: FlagResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Post already has active flag',
  })
  async createFlag(@Body() dto: CreateFlagDto) {
    return this.postFraudFlagsService.createFlag(dto);
  }

  @Get('post/:postId')
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Lấy thông tin cờ của bài viết (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Flag retrieved successfully',
    type: FlagResponseDto,
  })
  async getFlagByPostId(@Param('postId') postId: string) {
    return this.postFraudFlagsService.getFlagByPostId(postId);
  }

  @Put('post/:postId/status')
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Cập nhật trạng thái cờ (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Flag status updated successfully',
    type: FlagResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Flag not found',
  })
  async updateFlagStatus(@Param('postId') postId: string, @Body() dto: UpdateFlagStatusDto) {
    return this.postFraudFlagsService.updateFlagStatus(postId, dto);
  }

  @Get('list')
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Lấy danh sách bài viết bị gắn cờ (Admin only)' })
  @ApiQuery({
    name: 'status',
    enum: ['SUSPECTED', 'CONFIRMED', 'ALL'],
    required: false,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Flagged posts retrieved successfully',
    type: PaginatedFlaggedPostsResponseDto,
  })
  async getFlaggedPosts(
    @Query('status') status: 'SUSPECTED' | 'CONFIRMED' | 'ALL' = 'ALL',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const { data, total } = await this.postFraudFlagsService.getFlaggedPosts(status, page, limit);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  @Get('check/:postId')
  @ApiOperation({
    summary: 'Kiểm tra bài viết có bị nghi ngờ gian lận không',
    description: 'Public endpoint để check fraud status cho refund logic',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Check completed',
    schema: {
      type: 'object',
      properties: {
        postId: { type: 'string' },
        isFraudSuspected: { type: 'boolean' },
      },
    },
  })
  async checkFraudStatus(@Param('postId') postId: string) {
    const isFraudSuspected = await this.postFraudFlagsService.isPostFraudSuspected(postId);

    return {
      postId,
      isFraudSuspected,
    };
  }
}
