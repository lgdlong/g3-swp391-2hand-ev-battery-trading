import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminStatisticsService } from './admin-statistics.service';
import { FinancialOverviewDto, TransactionStatsDto, AdminDashboardStatsDto } from './dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { AccountRole } from '../../shared/enums/account-role.enum';

/**
 * Admin Statistics Controller
 * Provides comprehensive statistics for admin dashboard
 * All endpoints require admin authentication
 */
@ApiTags('Admin Statistics')
@Controller('admin/statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AccountRole.ADMIN)
@ApiBearerAuth()
export class AdminStatisticsController {
  constructor(private readonly adminStatsService: AdminStatisticsService) {}

  /**
   * Get complete admin dashboard statistics
   * Returns all statistics in one call for dashboard overview
   */
  @Get('dashboard')
  @ApiOperation({
    summary: 'Get complete admin dashboard statistics',
    description: `Get comprehensive statistics for admin dashboard including:
    - Financial overview (wallet balances, fees, revenue)
    - Transaction statistics

    This endpoint aggregates data from multiple sources to provide a complete overview.`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard statistics retrieved successfully',
    type: AdminDashboardStatsDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Admin access required',
  })
  async getDashboardStats(): Promise<AdminDashboardStatsDto> {
    return this.adminStatsService.getAdminDashboardStats();
  }

  /**
   * Get financial overview statistics
   */
  @Get('financial')
  @ApiOperation({
    summary: 'Get financial overview statistics',
    description: `Get detailed financial statistics including:
    - Total wallet balance across all users
    - Total topup amount via PayOS
    - Total fees collected (deposits + verifications)
    - Net revenue`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Financial statistics retrieved successfully',
    type: FinancialOverviewDto,
  })
  async getFinancialOverview(): Promise<FinancialOverviewDto> {
    return this.adminStatsService.getFinancialOverview();
  }

  /**
   * Get transaction statistics
   */
  @Get('transactions')
  @ApiOperation({
    summary: 'Get transaction statistics',
    description: `Get transaction statistics including:
    - Total wallet transactions
    - Transactions today
    - Total post payments
    - Total topup transactions
    - Total verification transactions`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction statistics retrieved successfully',
    type: TransactionStatsDto,
  })
  async getTransactionStats(): Promise<TransactionStatsDto> {
    return this.adminStatsService.getTransactionStats();
  }

  /**
   * Get total wallet balance
   */
  @Get('wallet-balance')
  @ApiOperation({
    summary: 'Get total wallet balance',
    description: 'Get sum of all user wallet balances',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Total wallet balance retrieved',
    schema: {
      type: 'object',
      properties: {
        totalBalance: {
          type: 'string',
          example: '50000000',
          description: 'Total balance in VND',
        },
      },
    },
  })
  async getTotalWalletBalance(): Promise<{ totalBalance: string }> {
    const totalBalance = await this.adminStatsService.getTotalWalletBalance();
    return { totalBalance };
  }

  /**
   * Get total topup amount
   */
  @Get('total-topup')
  @ApiOperation({
    summary: 'Get total topup amount',
    description: 'Get sum of all wallet topup transactions via PayOS',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Total topup amount retrieved',
    schema: {
      type: 'object',
      properties: {
        totalTopup: {
          type: 'string',
          example: '100000000',
          description: 'Total topup amount in VND',
        },
      },
    },
  })
  async getTotalTopupAmount(): Promise<{ totalTopup: string }> {
    const totalTopup = await this.adminStatsService.getTotalTopupAmount();
    return { totalTopup };
  }

  /**
   * Get total deposit collected
   */
  @Get('total-deposit')
  @ApiOperation({
    summary: 'Get total deposit collected',
    description: 'Get sum of all post payment deposits',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Total deposit amount retrieved',
    schema: {
      type: 'object',
      properties: {
        totalDeposit: {
          type: 'string',
          example: '12000000',
          description: 'Total deposit amount in VND',
        },
      },
    },
  })
  async getTotalDepositCollected(): Promise<{ totalDeposit: string }> {
    const totalDeposit = await this.adminStatsService.getTotalDepositCollected();
    return { totalDeposit };
  }

  /**
   * Get total POST_PAYMENT amount
   */
  @Get('post-payment-total')
  @ApiOperation({
    summary: 'Get total POST_PAYMENT amount',
    description: 'Get sum of all POST_PAYMENT transactions',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Total POST_PAYMENT amount retrieved',
    schema: {
      type: 'object',
      properties: {
        total: {
          type: 'string',
          example: '640000',
          description: 'Total POST_PAYMENT amount in VND',
        },
      },
    },
  })
  async getPostPaymentTotal(): Promise<{ total: string }> {
    const total = await this.adminStatsService.getPostPaymentTotal();
    return { total };
  }

  /**
   * Get total PLATFORM_FEE amount
   */
  @Get('platform-fee-total')
  @ApiOperation({
    summary: 'Get total PLATFORM_FEE amount',
    description: 'Get sum of all PLATFORM_FEE transactions',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Total PLATFORM_FEE amount retrieved',
    schema: {
      type: 'object',
      properties: {
        total: {
          type: 'string',
          example: '50000',
          description: 'Total PLATFORM_FEE amount in VND',
        },
      },
    },
  })
  async getPlatformFeeTotal(): Promise<{ total: string }> {
    const total = await this.adminStatsService.getPlatformFeeTotal();
    return { total };
  }

  /**
   * Get total revenue (POST_PAYMENT + PLATFORM_FEE)
   */
  @Get('total-revenue')
  @ApiOperation({
    summary: 'Get total revenue',
    description: 'Get sum of POST_PAYMENT and PLATFORM_FEE transactions',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Total revenue retrieved',
    schema: {
      type: 'object',
      properties: {
        total: {
          type: 'string',
          example: '690000',
          description: 'Total revenue in VND',
        },
      },
    },
  })
  async getTotalRevenue(): Promise<{ total: string }> {
    const total = await this.adminStatsService.getTotalRevenue();
    return { total };
  }

  /**
   * Get monthly revenue
   */
  @Get('monthly-revenue')
  @ApiOperation({
    summary: 'Get monthly revenue',
    description: 'Get revenue grouped by month (POST_PAYMENT + PLATFORM_FEE)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Monthly revenue retrieved',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          month: {
            type: 'string',
            example: '2025-01',
            description: 'Month in YYYY-MM format',
          },
          revenue: {
            type: 'string',
            example: '1000000',
            description: 'Total revenue for the month in VND',
          },
        },
      },
    },
  })
  async getMonthlyRevenue(): Promise<Array<{ month: string; revenue: string }>> {
    return this.adminStatsService.getMonthlyRevenue();
  }
}
