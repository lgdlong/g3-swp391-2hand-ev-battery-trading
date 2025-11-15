import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminStatisticsService } from './admin-statistics.service';
import {
  FinancialOverviewDto,
  FraudOverviewDto,
  TransactionStatsDto,
  AdminDashboardStatsDto,
} from './dto';
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
    - Fraud detection statistics
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
    - Total refund amount
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
   * Get fraud and risk statistics
   */
  @Get('fraud')
  @ApiOperation({
    summary: 'Get fraud and risk statistics',
    description: `Get fraud detection statistics including:
    - Total fraud flags
    - Suspected fraud count
    - Confirmed fraud count
    - Refund rate percentage`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fraud statistics retrieved successfully',
    type: FraudOverviewDto,
  })
  async getFraudOverview(): Promise<FraudOverviewDto> {
    return this.adminStatsService.getFraudOverview();
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
   * Get fraud count
   */
  @Get('fraud-count')
  @ApiOperation({
    summary: 'Get fraud flag count',
    description: 'Get count of all fraud flags by status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fraud count retrieved',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 12 },
        suspected: { type: 'number', example: 8 },
        confirmed: { type: 'number', example: 4 },
      },
    },
  })
  async getFraudCount(): Promise<{ total: number; suspected: number; confirmed: number }> {
    return this.adminStatsService.getFraudCount();
  }

  /**
   * Get total revenue from post payments
   */
  @Get('total-revenue')
  @ApiOperation({
    summary: 'Get total revenue',
    description:
      'Get total revenue from all post payments. In the new business model, all fees are retained (no refunds).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Total revenue retrieved',
    schema: {
      type: 'object',
      properties: {
        totalRevenue: {
          type: 'string',
          example: '15000000',
          description: 'Total revenue from post payments in VND',
        },
      },
    },
  })
  async getTotalRevenue(): Promise<{ totalRevenue: string }> {
    const totalRevenue = await this.adminStatsService.getTotalRevenue();
    return { totalRevenue };
  }
}
