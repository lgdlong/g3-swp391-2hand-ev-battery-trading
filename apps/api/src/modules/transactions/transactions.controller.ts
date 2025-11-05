import { Controller, Post, Body, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { PostPayment } from './entities/post-payment.entity';
import { RecordPostDepositDto } from './dto/record-post-deposit.dto';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Record post deposit payment
   * Called after user pays deposit for creating post
   */
  @Post('post-deposit')
  @ApiOperation({ 
    summary: 'Ghi nhận thanh toán đặt cọc khi tạo post',
    description: 'Được gọi sau khi user trả deposit (đặt cọc) để tạo post. Lưu vào post_payments để tracking cho refund.'
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
        hasDeposit: { type: 'boolean' }
      }
    }
  })
  async checkDepositStatus(@Param('postId') postId: string) {
    const hasDeposit = await this.transactionsService.hasDepositPayment(postId);
    return { postId, hasDeposit };
  }
}
