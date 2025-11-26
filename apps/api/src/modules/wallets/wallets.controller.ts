import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  HttpStatus,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { PayosService } from '../payos/payos.service';
import {
  WalletResponseDto,
  WalletTransactionResponseDto,
  DeductWalletDto,
  DeductResponseDto,
} from './dto';
import { ListQueryDto } from '../../shared/dto/list-query.dto';
import { CreateTopupDto } from './dto/create-topup.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { ReqUser } from '../../core/decorators/current-user.decorator';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { AccountRole } from '../../shared/enums/account-role.enum';
import { PayosCreatePaymentResponse } from '../payos/dto';

@ApiTags('Wallets')
@Controller('wallets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly payosService: PayosService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user wallet' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Wallet retrieved successfully',
    type: WalletResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Wallet not found' })
  async getMyWallet(@CurrentUser() user: ReqUser): Promise<WalletResponseDto> {
    const wallet = await this.walletsService.initWalletIfNotExists(user.sub);
    return wallet;
  }

  @Get(':userId')
  @UseGuards(RolesGuard)
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Get wallet by user ID (Admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Wallet retrieved successfully',
    type: WalletResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Wallet not found' })
  async getWallet(
    @Param('userId', new ParseIntPipe({ errorHttpStatusCode: 400 })) userId: number,
  ): Promise<WalletResponseDto> {
    const wallet = await this.walletsService.initWalletIfNotExists(userId);
    return wallet;
  }

  @Post('deduct/:userId')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Deduct money from wallet',
    description: 'User deducts funds from their wallet. Checks balance before deduction.',
  })
  @ApiParam({ name: 'userId', description: 'User ID', type: Number })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Deduction completed successfully',
    type: DeductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or insufficient balance',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Wallet not found' })
  async deductWallet(
    @Param('userId', new ParseIntPipe({ errorHttpStatusCode: 400 })) userId: number,
    @Body() dto: DeductWalletDto,
  ): Promise<DeductResponseDto> {
    const result = await this.walletsService.deductWallet(
      userId,
      dto.amount.toString(),
      dto.description,
      dto.paymentOrderId,
    );
    return result;
  }

  @Post('deduct')
  @ApiOperation({
    summary: 'Deduct money from current user wallet',
    description:
      'Deduct funds from the authenticated user wallet with detailed transaction tracking. ' +
      'Supports various service types (POST_PAYMENT, WALLET_TOPUP, etc.) and entity references. ' +
      'The serviceTypeCode parameter is optional - if not provided, defaults to generic deduction.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Deduction completed successfully',
    schema: {
      type: 'object',
      properties: {
        wallet: {
          $ref: '#/components/schemas/WalletResponseDto',
        },
        transaction: {
          $ref: '#/components/schemas/WalletTransactionResponseDto',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or insufficient balance',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Wallet not found' })
  async deduct(
    @CurrentUser() user: ReqUser,
    @Body() dto: DeductWalletDto,
  ): Promise<{ wallet: WalletResponseDto; transaction: WalletTransactionResponseDto }> {
    const result = await this.walletsService.deduct(
      user.sub,
      dto.amount.toString(),
      dto.serviceTypeCode || 'DEDUCTION',
      dto.description,
      dto.relatedEntityType,
      dto.relatedEntityId,
    );
    return result;
  }

  @Post('topup/payment')
  @ApiOperation({
    summary: 'Create topup payment link',
    description: 'Create a PayOS payment link for wallet topup. Returns QR code and payment URL.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment link created successfully',
    type: PayosCreatePaymentResponse,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async createTopupPayment(
    @CurrentUser() user: ReqUser,
    @Body() dto: CreateTopupDto,
  ): Promise<PayosCreatePaymentResponse> {
    // Create payment order first
    const { paymentOrder, payosRequest } = await this.walletsService.createTopupPayment(
      user.sub,
      dto,
    );

    // Create PayOS payment link
    const payosResponse = await this.payosService.create(payosRequest);

    // Update payment order with payment reference
    if (payosResponse.data?.paymentLinkId) {
      await this.walletsService.updatePaymentOrderRef(
        paymentOrder.id,
        payosResponse.data.paymentLinkId,
      );
    }

    return payosResponse;
  }

  @Post('topup/verify/:orderCode')
  @ApiOperation({
    summary: 'Verify and process topup payment',
    description:
      'Verify payment status with PayOS and process wallet topup if payment is successful. ' +
      'This is used when returning from PayOS checkout to ensure the payment is processed.',
  })
  @ApiParam({ name: 'orderCode', description: 'Payment order code', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment verified and processed successfully',
    type: WalletTransactionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment order not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Payment not completed or already processed',
  })
  async verifyAndProcessTopup(
    @CurrentUser() user: ReqUser,
    @Param('orderCode') orderCode: string,
  ): Promise<WalletTransactionResponseDto> {
    return this.walletsService.verifyAndProcessTopup(orderCode, user.sub);
  }

  @Get('transactions/me')
  @ApiOperation({ summary: 'Get current user wallet transactions' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transactions retrieved successfully',
    type: [WalletTransactionResponseDto],
  })
  async getMyTransactions(
    @CurrentUser() user: ReqUser,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<WalletTransactionResponseDto[]> {
    return this.walletsService.getTransactions(user.sub, limit, offset);
  }

  @Get('transactions/:userId')
  @UseGuards(RolesGuard)
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Get wallet transactions by user ID (Admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Wallet transactions retrieved successfully',
    type: [WalletTransactionResponseDto],
  })
  async getUserTransactions(
    @Param('userId', new ParseIntPipe({ errorHttpStatusCode: 400 })) userId: number,
  ): Promise<WalletTransactionResponseDto[]> {
    return this.walletsService.getTransactions(userId);
  }

  @Get('transactions/me/:transactionId')
  @ApiOperation({ summary: 'Get my wallet transaction by ID' })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction retrieved successfully',
    type: WalletTransactionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transaction not found or access denied',
  })
  async getMyTransaction(
    @CurrentUser() user: ReqUser,
    @Param('transactionId', new ParseIntPipe({ errorHttpStatusCode: 400 })) transactionId: number,
  ): Promise<WalletTransactionResponseDto> {
    return this.walletsService.getTransactionById(transactionId, user.sub);
  }

  @Get('transactions/orderCode/:orderCode')
  @ApiOperation({ summary: 'Get my wallet transaction by orderCode' })
  @ApiParam({ name: 'orderCode', description: 'Payment orderCode from PayOS', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction retrieved successfully',
    type: WalletTransactionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transaction not found or access denied',
  })
  async getMyTransactionByOrderCode(
    @CurrentUser() user: ReqUser,
    @Param('orderCode') orderCode: string,
  ): Promise<WalletTransactionResponseDto> {
    return this.walletsService.getTransactionByOrderCode(orderCode, user.sub);
  }

  @Get('transactions/admin/:transactionId')
  @UseGuards(RolesGuard)
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Get wallet transaction by ID (Admin only)' })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction retrieved successfully',
    type: WalletTransactionResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Transaction not found' })
  async getTransactionById(
    @Param('transactionId', new ParseIntPipe({ errorHttpStatusCode: 400 })) transactionId: number,
  ): Promise<WalletTransactionResponseDto> {
    return this.walletsService.getTransactionById(transactionId);
  }

  @Get('transactions/all')
  @UseGuards(RolesGuard)
  @Roles(AccountRole.ADMIN)
  // @ApiOperation({ summary: 'Get all wallet transactions (Admin only)' })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'All transactions retrieved successfully',
  //   type: [WalletTransactionResponseDto],
  // })
  async getAllTransactions(
    // @Query() query: ListQueryDto

    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<WalletTransactionResponseDto[]> {
    return this.walletsService.getAllTransactions(limit, offset);
  }

  @Get('transactions/all/count')
  @UseGuards(RolesGuard)
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Get total count of wallet transactions (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Total count retrieved successfully',
    schema: { type: 'number' },
  })
  async getTotalTransactionsCount(): Promise<number> {
    return this.walletsService.getTotalTransactionsCount();
  }

  @Get('payment-orders/all')
  @UseGuards(RolesGuard)
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Get all payment orders (Admin only)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 100 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All payment orders retrieved successfully',
  })
  async getAllPaymentOrders(
    @Query('limit', ParseIntPipe) limit?: number,
    @Query('offset', ParseIntPipe) offset?: number,
  ) {
    return this.walletsService.getAllPaymentOrders(limit, offset);
  }

  @Get('payment-orders/all/count')
  @UseGuards(RolesGuard)
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: 'Get total count of payment orders (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Total count retrieved successfully',
    schema: { type: 'number' },
  })
  async getTotalPaymentOrdersCount(): Promise<number> {
    return this.walletsService.getTotalPaymentOrdersCount();
  }
}
