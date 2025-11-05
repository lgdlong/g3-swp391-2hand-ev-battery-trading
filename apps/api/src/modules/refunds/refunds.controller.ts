import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { RefundsCronService } from './refunds-cron.service';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { AccountRole } from 'src/shared/enums/account-role.enum';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ManualRefundDto } from './dto/manual-refund.dto';
import { AdminDecideRefundDto } from './dto/admin-decide-refund.dto';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { ReqUser } from '../../core/decorators/current-user.decorator';

@ApiTags('Refunds')
@ApiBearerAuth()
@Controller('refunds')
export class RefundsController {
  constructor(
    private readonly refundsService: RefundsService,
    private readonly refundsCronService: RefundsCronService,
  ) {}

  /**
   * Lấy danh sách refunds (từ cron)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Get()
  @ApiOperation({
    summary: 'Get all refunds',
    description: 'Lấy tất cả refunds đã được tạo bởi cron job',
  })
  @ApiResponse({ status: 200, description: 'List of all refunds' })
  async getAllRefunds() {
    return this.refundsService.getAllRefunds();
  }

  /**
   * Lấy danh sách refund requests đang pending
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Get('pending')
  @ApiOperation({
    summary: 'Get pending refund requests',
    description: 'Lấy danh sách các refund đang chờ xử lý (status: PENDING)',
  })
  @ApiResponse({ status: 200, description: 'List of pending refunds' })
  async getPendingRefunds() {
    return this.refundsService.getPendingRefundsForAdmin();
  }

  /**
   * � Manual refund - Admin refund 1 post cụ thể
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post('manual')
  @ApiOperation({
    summary: '[ADMIN] Manual refund for specific post',
    description: `
      Admin tự refund deposit cho 1 post cụ thể.
      
      Có thể:
      - Tự động tính scenario dựa vào reviewedAt
      - Hoặc admin chọn scenario + custom rate
      - DryRun=true để xem preview trước khi refund
      
      Use cases:
      - User yêu cầu đặc biệt
      - Sửa lỗi cron
      - Refund ngoài policy
    `,
  })
  @ApiResponse({ status: 200, description: 'Manual refund completed' })
  async manualRefund(
    @Body() dto: ManualRefundDto,
    @CurrentUser() adminUser: ReqUser,
  ) {
    return this.refundsService.manualRefund(dto, adminUser);
  }

  /**
   * ✅❌ Admin approve/reject pending refund
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post(':refundId/decide')
  @ApiOperation({
    summary: '[ADMIN] Approve or reject pending refund',
    description: `
      Admin review và quyết định approve/reject refund đang PENDING.
      
      - approve: Thực hiện refund vào ví user
      - reject: Không refund, giữ tiền
      
      Thường dùng cho các case:
      - Cron tạo PENDING (scenario FRAUD_SUSPECTED)
      - Manual refund tạo PENDING để review
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
   * �🔥 Manual trigger cho cron job (Admin only - For testing)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post('cron/trigger-expired-refund')
  @ApiOperation({
    summary: '[ADMIN] Manually trigger expired posts refund check',
    description: `
      Endpoint này để test cron job manually.
      Sẽ quét và refund tất cả posts:
      - CANCEL_EARLY (< 7 ngày): 100%
      - CANCEL_LATE (7-30 ngày): 70%
      - EXPIRED (> 30 ngày): 50%
      
      🚨 Chỉ dùng để test! Production sẽ tự động chạy mỗi ngày lúc 00:00.
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
