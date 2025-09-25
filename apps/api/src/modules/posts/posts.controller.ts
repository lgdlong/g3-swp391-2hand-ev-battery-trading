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

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('car')
  async getCarPosts(@Query() query: ListQueryDto): Promise<BasePostResponseDto[]> {
    return this.postsService.getCarPosts(query);
  }

  @Get('bike')
  async getBikePosts(@Query() query: ListQueryDto): Promise<BasePostResponseDto[]> {
    return this.postsService.getBikePosts(query);
  }

  @Post('car')
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
