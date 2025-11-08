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
import {
  RefundResponseDto,
  ManualRefundResponseDto,
  DryRunResponseDto,
  AdminDecideRefundResponseDto,
  CronTriggerResponseDto,
} from './dto/refund-response.dto';
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
   * Get all refunds created by cron job
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Get()
  @ApiOperation({
    summary: 'Get all refunds',
    description: 'Retrieve all refunds created by the cron job',
  })
  @ApiResponse({ status: 200, description: 'List of all refunds', type: [RefundResponseDto] })
  async getAllRefunds() {
    return this.refundsService.getAllRefunds();
  }

  /**
   * Get pending refund requests
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Get('pending')
  @ApiOperation({
    summary: 'Get pending refund requests',
    description: 'Retrieve all refunds with PENDING status awaiting admin review',
  })
  @ApiResponse({ status: 200, description: 'List of pending refunds', type: [RefundResponseDto] })
  async getPendingRefunds() {
    return this.refundsService.getPendingRefundsForAdmin();
  }

  /**
   * Manual refund - Admin refund 1 post cụ thể
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post('manual')
  @ApiOperation({
    summary: '[ADMIN] Manual refund for specific post',
    description: `
      Admin manually create refund request for a specific post.

      Features:
      - Auto-calculate scenario based on reviewedAt
      - Or admin can specify scenario + custom rate
      - DryRun=true to preview before creating

      Use cases:
      - User special request
      - Fix cron errors
      - Refund outside policy
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Manual refund created (PENDING status)',
    type: ManualRefundResponseDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Dry run preview (when dryRun=true)',
    type: DryRunResponseDto,
  })
  async manualRefund(@Body() dto: ManualRefundDto, @CurrentUser() adminUser: ReqUser) {
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
      Admin reviews and decides to approve or reject PENDING refund.

      - approve: Execute refund to user wallet
      - reject: No refund, retain funds

      Common use cases:
      - Cron created PENDING (FRAUD_SUSPECTED scenario)
      - Manual refund pending review
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Refund decision processed',
    type: AdminDecideRefundResponseDto,
  })
  async adminDecideRefund(
    @Param('refundId') refundId: string,
    @Body() dto: AdminDecideRefundDto,
    @CurrentUser() adminUser: ReqUser,
  ) {
    return this.refundsService.adminDecideRefund(refundId, dto.decision, adminUser);
  }

  /**
   * � Get posts eligible for refund (chờ cron job quét)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Get('candidates')
  @ApiOperation({
    summary: '[ADMIN] Get posts eligible for refund',
    description: `
      Lấy danh sách các post đang chờ hoàn tiền - đủ điều kiện refund nhưng chưa được cron job xử lý.

      Điều kiện:
      - Post đã được duyệt (có reviewedAt)
      - Status: PUBLISHED (có thể hết hạn > 30 ngày) hoặc ARCHIVED (user đã hủy)
      - Chưa có refund record

      Admin có thể dùng để kiểm tra và manual refund nếu cần gấp.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'List of posts eligible for refund',
    // type: [PostCandidateResponseDto], // TODO: Tạo DTO nếu cần
  })
  async getRefundCandidates() {
    return this.refundsCronService.getRefundCandidatePosts();
  }

  /**
   * ⚡ Manual refund cho một post cụ thể
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post(':postId/manual-refund')
  @ApiOperation({
    summary: '[ADMIN] Manual refund for specific post',
    description: `
      Admin thực hiện refund thủ công cho một post cụ thể (nếu cần gấp, không chờ cron job).

      Sẽ kiểm tra:
      - Post có đủ điều kiện refund không
      - Post chưa có refund record
      - Tính toán scenario và rate
      - Thực hiện refund vào ví user ngay lập tức
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Manual refund result',
    // type: ManualRefundForPostResponseDto, // TODO: Tạo DTO nếu cần
  })
  async manualRefundForPost(@Param('postId') postId: string) {
    return this.refundsCronService.processManualRefundForPost(postId);
  }

  /**
   * �🔥 Manual trigger for cron job (Admin only - For testing)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post('cron/trigger-expired-refund')
  @ApiOperation({
    summary: '[ADMIN] Manually trigger expired posts refund check',
    description: `
      Endpoint to manually test the cron job.
      Scans and refunds all expired posts:
      - CANCEL_EARLY (< 7 days): 100%
      - CANCEL_LATE (7-30 days): 70%
      - EXPIRED (> 30 days): 50%

      ⚠️ For testing only! Production runs automatically daily at 00:00.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Manual refund check completed',
    type: CronTriggerResponseDto,
  })
  async triggerExpiredRefund() {
    return this.refundsCronService.triggerManualRefundCheck();
  }
}
