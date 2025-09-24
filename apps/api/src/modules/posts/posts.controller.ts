import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { AccountRole } from 'src/shared/enums/account-role.enum';
import { PostType } from '../../shared/enums/post.enum';
import { RolesGuard } from '../../core/guards/roles.guard';
import type { AuthUser } from '../../core/guards/roles.guard';
import { User } from '../../core/decorators/user.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(AccountRole.USER)
  // create(@Body() createPostDto: CreatePostDto, @User() user: AuthUser) {
  //   return this.postsService.create(createPostDto, user);
  // }

  @Post('car')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.USER)
  async createCarPost(@Body() dto: CreatePostDto, @User() user: AuthUser) {
    // force EV_CAR cho endpoint này
    dto.postType = PostType.EV_CAR;

    // fix: use correct variable name 'user' instead of 'u'
    const sellerId = user.sub;
    return this.postsService.createCarPost({ ...dto, sellerId });
  }
}
