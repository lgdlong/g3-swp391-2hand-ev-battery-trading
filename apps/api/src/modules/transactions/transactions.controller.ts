import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreatePostPaymentDto } from './dto/create-post-payment.dto';
import { PostPaymentResponseDto } from './dto/post-payment-response.dto';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { ReqUser } from '../../core/decorators/current-user.decorator';

@ApiTags('Post Payments')
@ApiBearerAuth()
@Controller('transactions/post-payments')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post payment record' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Post payment created successfully',
    type: PostPaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async createPostPayment(
    @Body() createPostPaymentDto: CreatePostPaymentDto,
  ): Promise<PostPaymentResponseDto> {
    return this.transactionsService.createPostPayment(createPostPaymentDto);
  }

  @Get('post/:postId')
  @ApiOperation({ summary: 'Get post payment by post ID' })
  @ApiParam({ name: 'postId', description: 'ID of the post' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Post payment found',
    type: PostPaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Post payment not found',
  })
  async getPostPaymentByPostId(@Param('postId') postId: string): Promise<PostPaymentResponseDto> {
    return this.transactionsService.getPostPaymentByPostId(postId);
  }

  @Get('account/:accountId')
  @ApiOperation({ summary: 'Get all post payments by account ID' })
  @ApiParam({ name: 'accountId', description: 'ID of the account' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Post payments found',
    type: [PostPaymentResponseDto],
  })
  async getPostPaymentsByAccountId(
    @Param('accountId', ParseIntPipe) accountId: number,
  ): Promise<PostPaymentResponseDto[]> {
    return this.transactionsService.getPostPaymentsByAccountId(accountId);
  }

  @Get('my-payments')
  @ApiOperation({ summary: 'Get my post payments (current user)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'My post payments found',
    type: [PostPaymentResponseDto],
  })
  async getMyPostPayments(@CurrentUser() user: ReqUser): Promise<PostPaymentResponseDto[]> {
    return this.transactionsService.getPostPaymentsByAccountId(user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all post payments with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Post payments retrieved successfully',
  })
  async getAllPostPayments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: PostPaymentResponseDto[]; total: number; page: number; limit: number }> {
    return this.transactionsService.getAllPostPayments(page, limit);
  }

  @Get('check/:postId')
  @ApiOperation({ summary: 'Check if post has been paid for' })
  @ApiParam({ name: 'postId', description: 'ID of the post' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment status checked',
    schema: {
      type: 'object',
      properties: {
        postId: { type: 'string' },
        isPaid: { type: 'boolean' },
      },
    },
  })
  async checkPostPayment(
    @Param('postId') postId: string,
  ): Promise<{ postId: string; isPaid: boolean }> {
    const isPaid = await this.transactionsService.isPostPaid(postId);
    return { postId, isPaid };
  }

  @Delete('post/:postId')
  @ApiOperation({ summary: 'Delete post payment (use with caution)' })
  @ApiParam({ name: 'postId', description: 'ID of the post' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Post payment deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Post payment not found',
  })
  async deletePostPayment(@Param('postId') postId: string): Promise<{ message: string }> {
    await this.transactionsService.deletePostPayment(postId);
    return { message: 'Post payment deleted successfully' };
  }
}
