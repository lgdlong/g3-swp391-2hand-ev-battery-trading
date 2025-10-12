import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PostReviewService } from './post-review.service';
import {
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PostReviewLogDto } from './dto/post-review-logs.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { AccountRole } from '../../shared/enums/account-role.enum';

@ApiTags('Post Review Logs')
@Controller('post-review')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PostReviewController {
  constructor(private readonly postReviewService: PostReviewService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(AccountRole.ADMIN)
  @ApiOperation({
    summary: 'Get all post review logs',
    description: 'Retrieve all post review logs. This endpoint is restricted to admin users only.',
  })
  @ApiOkResponse({
    description: 'List of all post review logs retrieved successfully',
    type: [PostReviewLogDto],
    schema: {
      example: [
        {
          id: 1,
          postId: 'post-123',
          actorId: 'user-456',
          oldStatus: 'PENDING_REVIEW',
          newStatus: 'PUBLISHED',
          action: 'APPROVED',
          reason: null,
          createdAt: '2025-10-12T10:00:00Z',
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token is missing or invalid',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - User does not have admin role',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  async findAll() {
    return this.postReviewService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(AccountRole.USER, AccountRole.ADMIN)
  @ApiOperation({
    summary: 'Get a post review log by ID',
    description:
      'Retrieve a specific post review log by its ID. This endpoint is restricted to regular users.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the post review log',
    type: 'number',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Post review log retrieved successfully',
    type: PostReviewLogDto,
    schema: {
      example: {
        id: 1,
        postId: 'post-123',
        actorId: 'user-456',
        oldStatus: 'PENDING_REVIEW',
        newStatus: 'PUBLISHED',
        action: 'APPROVED',
        reason: null,
        createdAt: '2025-10-12T10:00:00Z',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token is missing or invalid',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - User does not have user role',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  async findOne(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 }))
    id: string,
  ) {
    return this.postReviewService.findOne(id);
  }
}
