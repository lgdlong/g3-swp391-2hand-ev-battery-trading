import { Controller, Get, Post, Body, Patch, Param, Delete, UnauthorizedException, UseGuards } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { RefundsCronService } from './refunds-cron.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import { UpdateRefundDto } from './dto/update-refund.dto';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { ReqUser } from '../../core/decorators/current-user.decorator';
import { RefundRequestDto } from './dto/refund-request.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { AccountRole } from 'src/shared/enums/account-role.enum';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminDecideRefundDto } from './dto/admin-decide-refund.dto';

@ApiTags('Refunds')
@ApiBearerAuth()
@Controller('refunds')
export class RefundsController {
  constructor(
    private readonly refundsService: RefundsService,
    private readonly refundsCronService: RefundsCronService,
  ) {}

  /**
   * Xử lý refund request (auto hoặc tạo pending cho admin)
   * Dùng cho cả dry-run và thực thi
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post()
  @ApiOperation({
    summary: 'Process refund request',
    description: `
      Xử lý yêu cầu hoàn tiền theo các chính sách:
      - EXPIRED (hết hạn không gian lận): 80% auto refund
      - CANCEL_EARLY (hủy sớm): 100% auto refund  
      - HIGH_INTERACTION (hủy sau tương tác cao): 50% (có thể cần admin review)
      - FRAUD_SUSPECTED (gian lận): Hold 3-5 ngày → admin quyết định
      
      Set dryRun=true để xem preview trước khi thực hiện.
    `,
  })
  @ApiResponse({ status: 200, description: 'Refund processed or created for admin review' })
  async handleRefund(@Body() dto: RefundRequestDto, @CurrentUser() user: ReqUser) {
    return this.refundsService.handleRefund(dto, user);
  }

  /**
   * Lấy danh sách refund requests cần admin review
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Get('pending')
  @ApiOperation({
    summary: 'Get pending refund requests',
    description: 'Lấy danh sách các refund request đang chờ admin review (FRAUD_SUSPECTED, HIGH_INTERACTION)',
  })
  @ApiResponse({ status: 200, description: 'List of pending refund requests' })
  async getPendingRefunds() {
    return this.refundsService.getPendingRefundsForAdmin();
  }

  /**
   * Lấy chi tiết refund request
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Get(':refundId')
  @ApiOperation({
    summary: 'Get refund detail',
    description: 'Lấy chi tiết refund request bao gồm payment order, account info',
  })
  @ApiResponse({ status: 200, description: 'Refund detail' })
  async getRefundDetail(@Param('refundId') refundId: string) {
    return this.refundsService.getRefundDetail(refundId);
  }

  /**
   * Admin approve/reject refund request
   * Chỉ dùng cho các request ở trạng thái PENDING
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post(':refundId/decide')
  @ApiOperation({
    summary: 'Admin decide refund (approve/reject)',
    description: `
      Admin quyết định approve hoặc reject refund request.
      - approve: Thực hiện refund vào ví user
      - reject: Giữ tiền, không hoàn
      
      Chỉ áp dụng cho refund ở trạng thái PENDING và đã hết hold period (3-5 ngày).
    `,
  })
  @ApiResponse({ status: 200, description: 'Refund decision processed' })
  async adminDecideRefund(
    @Param('refundId') refundId: string,
    @Body() dto: AdminDecideRefundDto,
    @CurrentUser() adminUser: ReqUser,
  ) {
    return this.refundsService.adminDecideRefund(
      refundId,
      dto.decision,
      adminUser,
      dto.adminNotes,
    );
  }

  /**
   * 🔥 Manual trigger cho cron job (Admin only - For testing)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post('cron/trigger-expired-refund')
  @ApiOperation({
    summary: '[ADMIN] Manually trigger expired posts refund check',
    description: `
      Endpoint này để test cron job manually.
      Sẽ quét và refund tất cả posts hết hạn (> 30 ngày) chưa được refund.
      
      🚨 Chỉ dùng để test! Production sẽ tự động chạy mỗi 12h đêm.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Manual refund check completed',
    schema: {
      type: 'object',
      properties: {
        processed: { type: 'number', example: 5 },
        success: { type: 'number', example: 4 },
        failed: { type: 'number', example: 1 },
      },
    },
  })
  async triggerExpiredRefund() {
    return this.refundsCronService.triggerManualRefundCheck();
  }
}
