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
import { PostReviewLogResponseDto } from './dto/post-review-log-response.dto';
import { PostReviewLogMapper } from './mappers/post-review-log.mapper';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import type { AuthUser } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { AccountRole } from '../../shared/enums/account-role.enum';
import { User } from 'src/core/decorators/user.decorator';

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
    type: [PostReviewLogResponseDto],
    schema: {
      example: [
        {
          id: '1',
          postId: '123',
          actorId: '456',
          oldStatus: 'PENDING_REVIEW',
          newStatus: 'PUBLISHED',
          action: 'APPROVED',
          reason: null,
          actor: {
            id: '456',
            displayName: 'Admin User',
          },
          createdAt: '2025-10-12T10:00:00.000Z',
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
    const entities = await this.postReviewService.findAll();
    return PostReviewLogMapper.toResponseDtoArray(entities);
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
    type: PostReviewLogResponseDto,
    schema: {
      example: {
        id: '1',
        postId: '123',
        actorId: '456',
        oldStatus: 'PENDING_REVIEW',
        newStatus: 'PUBLISHED',
        action: 'APPROVED',
        reason: null,
        actor: {
          id: '456',
          displayName: 'Admin User',
        },
        createdAt: '2025-10-12T10:00:00.000Z',
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
    const entity = await this.postReviewService.findOne(id);
    return entity ? PostReviewLogMapper.toResponseDto(entity) : null;
  }

  @Get('post/:postId')
  @UseGuards(RolesGuard)
  @Roles(AccountRole.USER, AccountRole.ADMIN)
  @ApiOperation({
    summary: 'Get post review logs by post ID',
    description:
      'Retrieve all review logs for a specific post by its ID. This endpoint is accessible to users and admins.',
  })
  @ApiParam({
    name: 'postId',
    description: 'The unique identifier of the post',
    type: 'number',
    example: 123,
  })
  @ApiOkResponse({
    description: 'Post review logs retrieved successfully',
    type: [PostReviewLogResponseDto],
    schema: {
      example: [
        {
          id: '1',
          postId: '123',
          actorId: '456',
          oldStatus: 'PENDING_REVIEW',
          newStatus: 'PUBLISHED',
          action: 'APPROVED',
          reason: null,
          actor: {
            id: '456',
            displayName: 'Admin User',
          },
          createdAt: '2025-10-12T10:00:00.000Z',
        },
        {
          id: '2',
          postId: '123',
          actorId: '789',
          oldStatus: 'DRAFT',
          newStatus: 'PENDING_REVIEW',
          action: 'SUBMITTED',
          reason: null,
          actor: {
            id: '789',
            displayName: 'John Doe',
          },
          createdAt: '2025-10-11T15:30:00.000Z',
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
    description: 'Forbidden - User does not have required role',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  async findByPostId(
    @Param('postId', new ParseIntPipe({ errorHttpStatusCode: 400 })) postId: number,
  ) {
    // Convert numeric ID to string for service which expects string ID
    const entities = await this.postReviewService.findByPostId(postId.toString());
    return PostReviewLogMapper.toResponseDtoArray(entities);
  }

  @Get('post/:postId/me')
  @ApiOperation({
    summary: 'Get review logs for my own post by post ID',
    description: 'Retrieve all review logs for a specific post owned by the authenticated user.',
  })
  @ApiParam({
    name: 'postId',
    description: 'The unique identifier of the post',
    type: 'number',
    example: 123,
  })
  @ApiOkResponse({
    description: 'Review logs retrieved successfully for the user-owned post',
    type: [PostReviewLogResponseDto],
    schema: {
      example: [
        {
          id: '1',
          postId: '123',
          actorId: '456',
          oldStatus: 'DRAFT',
          newStatus: 'PENDING_REVIEW',
          action: 'SUBMITTED',
          reason: null,
          actor: {
            id: '456',
            displayName: 'John Doe',
          },
          createdAt: '2025-10-12T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token is missing or invalid',
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - User does not own the specified post',
    schema: { example: { statusCode: 403, message: 'Forbidden resource', error: 'Forbidden' } },
  })
  @UseGuards(RolesGuard)
  @Roles(AccountRole.USER)
  async findMyPostReviewLogByPostId(
    @Param('postId', new ParseIntPipe({ errorHttpStatusCode: 400 })) postId: number,
    @User() user: AuthUser,
  ) {
    const entities = await this.postReviewService.findOneByMyPostId(
      user.sub.toString(),
      postId.toString(),
    );
    return PostReviewLogMapper.toResponseDtoArray(entities);
  }
}
