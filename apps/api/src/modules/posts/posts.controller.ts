import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { AccountRole } from 'src/shared/enums/account-role.enum';
import { PostType } from '../../shared/enums/post.enum';
import { RolesGuard } from '../../core/guards/roles.guard';
import type { AuthUser } from '../../core/guards/roles.guard';
import { User } from '../../core/decorators/user.decorator';
import { CreateBikePostDto } from './dto/bike/create-post-bike.dto';
import { CreateCarPostDto } from './dto/car/create-post-car.dto';
import { ListQueryDto } from 'src/shared/dto/list-query.dto';
import { BasePostResponseDto } from './dto/base-post-response.dto';
import { BikeDetailsResponseDto } from '../post-details/dto/bike/bike-details-response.dto';
import { CarDetailsResponseDto } from '../post-details/dto/car/car-details-response.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';

@ApiTags('posts')
@ApiExtraModels(BasePostResponseDto, CarDetailsResponseDto, BikeDetailsResponseDto)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('car')
  @ApiOperation({ summary: 'Danh sách bài đăng xe ô tô điện (EV_CAR)' })
  @ApiOkResponse({
    description: 'Danh sách bài đăng xe ô tô điện',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(BasePostResponseDto) },
    },
  })
  @ApiBadRequestResponse({ description: 'Query không hợp lệ' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  async getCarPosts(@Query() query: ListQueryDto): Promise<BasePostResponseDto[]> {
    return this.postsService.getCarPosts(query);
  }

  @Get('bike')
  @ApiOperation({ summary: 'Danh sách bài đăng xe máy điện (EV_BIKE)' })
  @ApiOkResponse({
    description: 'Danh sách bài đăng xe máy điện',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(BasePostResponseDto) },
    },
  })
  @ApiBadRequestResponse({ description: 'Query không hợp lệ' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  async getBikePosts(@Query() query: ListQueryDto): Promise<BasePostResponseDto[]> {
    return this.postsService.getBikePosts(query);
  }

  @Post('car')
  @ApiOperation({ summary: 'Tạo bài đăng ô tô điện' })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Tạo bài đăng thành công',
    schema: { $ref: getSchemaPath(BasePostResponseDto) },
  })
  @ApiBadRequestResponse({ description: 'Body không hợp lệ' })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @ApiForbiddenResponse({ description: 'Không đủ quyền' })
  @ApiBody({ type: CreateCarPostDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.USER)
  async createCarPost(
    @Body() dto: CreateCarPostDto,
    @User() user: AuthUser,
  ): Promise<BasePostResponseDto | null> {
    // force EV_CAR cho endpoint này
    dto.postType = PostType.EV_CAR;

    // fix: use correct variable name 'user' instead of 'u'
    const sellerId = user.sub;
    return this.postsService.createCarPost(dto, sellerId);
  }

  @Post('bike')
  @ApiOperation({ summary: 'Tạo bài đăng xe máy điện' })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Tạo bài đăng thành công',
    schema: { $ref: getSchemaPath(BasePostResponseDto) },
  })
  @ApiBadRequestResponse({ description: 'Body không hợp lệ' })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @ApiForbiddenResponse({ description: 'Không đủ quyền' })
  @ApiBody({ type: CreateBikePostDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.USER)
  async createBikePost(
    @Body() dto: CreateBikePostDto,
    @User() user: AuthUser,
  ): Promise<BasePostResponseDto | null> {
    // force EV_CAR cho endpoint này
    dto.postType = PostType.EV_BIKE;

    const sellerId = user.sub;
    return this.postsService.createBikePost(dto, sellerId);
  }
}
