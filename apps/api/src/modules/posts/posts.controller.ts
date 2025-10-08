import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { UploadService } from '../upload/upload.service';
import { MultipleImageUploadInterceptor } from '../../core/interceptors/image-upload.interceptor';
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
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';

@ApiTags('posts')
@ApiExtraModels(BasePostResponseDto, CarDetailsResponseDto, BikeDetailsResponseDto)
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly uploadService: UploadService,
  ) {}

  //-----------------------------------------
  //------------ GET ENDPOINTS --------------
  //-----------------------------------------
  @ApiBearerAuth()
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
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'q', required: false, type: String, example: 'vinfast' })
  @ApiQuery({ name: 'sort', required: false, type: String, example: '-createdAt' })
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
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'q', required: false, type: String, example: 'yamaha' })
  @ApiQuery({ name: 'sort', required: false, type: String, example: 'price' })
  async getBikePosts(@Query() query: ListQueryDto): Promise<BasePostResponseDto[]> {
    return this.postsService.getBikePosts(query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm bài đăng theo tiêu đề (title)' })
  @ApiOkResponse({
    description: 'Danh sách bài đăng phù hợp với từ khóa tìm kiếm',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(BasePostResponseDto) },
    },
  })
  @ApiBadRequestResponse({ description: 'Query không hợp lệ' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    example: 'vinfast',
    description: 'Từ khóa tìm kiếm trong tiêu đề bài đăng',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiQuery({
    name: 'postType',
    required: false,
    enum: ['EV_CAR', 'EV_BIKE', 'BATTERY'],
    description: 'Lọc theo loại bài đăng',
  })
  @ApiQuery({
    name: 'provinceNameCached',
    required: false,
    type: String,
    example: 'Hà Nội',
    description: 'Lọc theo tỉnh/thành phố',
  })
  async searchPosts(
    @Query() query: ListQueryDto & { postType?: PostType; provinceNameCached?: string },
  ): Promise<BasePostResponseDto[]> {
    if (!query.q) {
      throw new BadRequestException('Tham số "q" (từ khóa tìm kiếm) là bắt buộc');
    }
    return this.postsService.searchPostsByTitle(query.q, query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Get('admin/all')
  @ApiOperation({ summary: 'Lấy tất cả bài đăng cho admin (cần quyền admin)' })
  @ApiOkResponse({
    description: 'Danh sách tất cả bài đăng',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(BasePostResponseDto) },
    },
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'q', required: false, type: String, example: 'vinfast' })
  @ApiQuery({ name: 'sort', required: false, type: String, example: '-createdAt' })
  @ApiQuery({ name: 'status', required: false, type: String, example: 'PENDING_REVIEW' })
  @ApiQuery({ name: 'postType', required: false, type: String, example: 'EV_CAR' })
  async getAllPostsForAdmin(
    @Query() query: ListQueryDto & { status?: string; postType?: string },
  ): Promise<BasePostResponseDto[]> {
    return this.postsService.getAllPostsForAdmin(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết bài đăng theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID của bài đăng',
    example: '1',
  })
  @ApiOkResponse({
    description: 'Thông tin chi tiết bài đăng',
    schema: { $ref: getSchemaPath(BasePostResponseDto) },
  })
  @ApiBadRequestResponse({ description: 'ID không hợp lệ' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bài đăng' })
  async getPostById(@Param('id') id: string): Promise<BasePostResponseDto> {
    return this.postsService.getPostById(id);
  }

  //-----------------------------------------
  //------------ POST ENDPOINTS -------------
  //-----------------------------------------

  @Post('car')
  @ApiOperation({ summary: 'Tạo bài đăng ô tô điện' })
  @ApiBearerAuth() // khớp với .addBearerAuth trong main.ts
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
    dto.postType = PostType.EV_CAR;
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
    dto.postType = PostType.EV_BIKE;
    const sellerId = user.sub;
    return this.postsService.createBikePost(dto, sellerId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.USER)
  @Post(':postId/images')
  @ApiOperation({ summary: 'Upload images cho bài đăng' })
  @ApiBearerAuth()
  @ApiParam({ name: 'postId', type: String, example: '123' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Tối đa 10 ảnh, field name: files',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
      required: ['files'],
    },
  })
  @ApiOkResponse({
    description: 'Danh sách ảnh đã upload',
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              public_id: { type: 'string', example: 'posts/123/abc_xyz' },
              url: {
                type: 'string',
                example: 'https://res.cloudinary.com/.../image/upload/v123/abc.jpg',
              },
              width: { type: 'number', example: 1280 },
              height: { type: 'number', example: 720 },
              bytes: { type: 'number', example: 102400 },
              format: { type: 'string', nullable: true, example: 'jpg' },
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'No files provided / Invalid postId' })
  @UseInterceptors(MultipleImageUploadInterceptor(10))
  async uploadPostImages(
    @Param('postId') postId: string,
    @User() user: AuthUser,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (!postId || isNaN(+postId)) {
      throw new BadRequestException('Invalid postId');
    }

    const uploaded = await Promise.all(
      files.map(async (file) => {
        const res = await this.uploadService.uploadImage(file, {
          folder: `posts/${postId}`,
        });
        return {
          public_id: res.public_id,
          url: res.secure_url,
          width: res.width,
          height: res.height,
          bytes: res.bytes,
          format: res.format ?? null,
        };
      }),
    );

    await this.postsService.addImages(postId, uploaded);

    return { images: uploaded };
  }

  //-----------------------------------------
  //------------ PATCH ENDPOINTS ------------
  //-----------------------------------------

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Patch(':id/approve')
  @ApiOperation({ summary: 'Duyệt bài đăng (Admin only)' })
  @ApiParam({ name: 'id', type: String, example: '123' })
  @ApiOkResponse({
    description: 'Duyệt bài đăng thành công',
    schema: { $ref: getSchemaPath(BasePostResponseDto) },
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bài đăng' })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @ApiForbiddenResponse({ description: 'Không đủ quyền admin' })
  async approvePost(@Param('id') id: string): Promise<BasePostResponseDto> {
    return this.postsService.approvePost(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Patch(':id/reject')
  @ApiOperation({ summary: 'Từ chối bài đăng (Admin only)' })
  @ApiParam({ name: 'id', type: String, example: '123' })
  @ApiBody({
    description: 'Lý do từ chối (optional)',
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', example: 'Nội dung không phù hợp' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Từ chối bài đăng thành công',
    schema: { $ref: getSchemaPath(BasePostResponseDto) },
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bài đăng' })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @ApiForbiddenResponse({ description: 'Không đủ quyền admin' })
  async rejectPost(
    @Param('id') id: string,
    @Body() body?: { reason?: string },
  ): Promise<BasePostResponseDto> {
    return this.postsService.rejectPost(id, body?.reason);
  }
}
