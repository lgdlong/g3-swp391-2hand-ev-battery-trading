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
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiOkResponse,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { PostPayment } from './entities/post-payment.entity';
import { RecordPostDepositDto } from './dto/record-post-deposit.dto';
import { CreatePostPaymentDto } from './dto/create-post-payment.dto';
import { PostPaymentResponseDto } from './dto/post-payment-response.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { ReqUser } from '../../core/decorators/current-user.decorator';

@ApiTags('Transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // Post Payment endpoints
  @Post('post-payments')
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

  @Get('post-payments/post/:postId')
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

  @Get('post-payments/account/:accountId')
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

  @Get('post-payments/my-payments')
  @ApiOperation({ summary: 'Get my post payments (current user)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'My post payments found',
    type: [PostPaymentResponseDto],
  })
  async getMyPostPayments(@CurrentUser() user: ReqUser): Promise<PostPaymentResponseDto[]> {
    return this.transactionsService.getPostPaymentsByAccountId(user.sub);
  }

  @Get('post-payments')
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

  @Get('post-payments/check/:postId')
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

  @Delete('post-payments/post/:postId')
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

  /**
   * Record post deposit payment
   * Called after user pays deposit for creating post
   */
  @Post('post-deposit')
  @ApiOperation({
    summary: 'Ghi nhận thanh toán đặt cọc khi tạo post',
    description:
      'Được gọi sau khi user trả deposit (đặt cọc) để tạo post. Lưu vào post_payments để tracking cho refund.',
  })
  @ApiBody({ type: RecordPostDepositDto })
  @ApiCreatedResponse({ description: 'Deposit payment recorded successfully', type: PostPayment })
  async recordPostDeposit(@Body() dto: RecordPostDepositDto): Promise<PostPayment> {
    return await this.transactionsService.recordPostDepositPayment(
      dto.postId,
      dto.accountId,
      dto.amountPaid,
      dto.walletTransactionId,
    );
  }

  /**
   * Get post deposit payment info
   */
  @Get('post-deposit/:postId')
  @ApiOperation({ summary: 'Lấy thông tin deposit payment của post' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiOkResponse({ description: 'Post deposit payment info', type: PostPayment })
  async getPostDepositPayment(@Param('postId') postId: string): Promise<PostPayment> {
    const payment = await this.transactionsService.getPostDepositPayment(postId);
    if (!payment) {
      throw new NotFoundException(`Deposit payment for post ${postId} not found`);
    }
    return payment;
  }

  /**
   * Check if post has deposit payment
   */
  @Get('post-deposit/:postId/status')
  @ApiOperation({ summary: 'Kiểm tra post đã trả deposit chưa' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        postId: { type: 'string' },
        hasDeposit: { type: 'boolean' },
      },
    },
  })
  async checkDepositStatus(@Param('postId') postId: string) {
    const hasDeposit = await this.transactionsService.hasDepositPayment(postId);
    return { postId, hasDeposit };
  }
}
