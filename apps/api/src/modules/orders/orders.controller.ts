import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto, OrderWithRelationsDto } from './dto/order-response.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { ReqUser } from '../../core/decorators/current-user.decorator';
import { AccountRole } from '../../shared/enums/account-role.enum';
import { OrderStatus } from '../../shared/enums/order-status.enum';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Tạo đơn hàng mới (Buyer mua hàng)
   */
  @Post()
  @ApiOperation({ summary: 'Tạo đơn hàng mới', description: 'Buyer tạo đơn mua hàng' })
  @ApiResponse({ status: HttpStatus.CREATED, type: OrderResponseDto })
  async create(@CurrentUser() user: ReqUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.sub, dto);
  }

  /**
   * Buyer thanh toán đơn hàng
   */
  @Post(':id/pay')
  @ApiOperation({ summary: 'Thanh toán đơn hàng', description: 'Buyer thanh toán từ ví' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: HttpStatus.OK, type: OrderResponseDto })
  async payOrder(@CurrentUser() user: ReqUser, @Param('id') orderId: string) {
    return this.ordersService.payOrder(orderId, user.sub);
  }

  /**
   * Seller xác nhận đơn hàng
   */
  @Post(':id/confirm')
  @ApiOperation({
    summary: 'Seller xác nhận đơn',
    description: 'Seller xác nhận đã nhận được đơn, bắt đầu giao hàng',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: HttpStatus.OK, type: OrderResponseDto })
  async sellerConfirm(@CurrentUser() user: ReqUser, @Param('id') orderId: string) {
    return this.ordersService.sellerConfirm(orderId, user.sub);
  }

  /**
   * Buyer xác nhận đã nhận hàng
   */
  @Post(':id/received')
  @ApiOperation({
    summary: 'Xác nhận đã nhận hàng',
    description: 'Buyer xác nhận đã nhận hàng, tiền chuyển cho seller',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: HttpStatus.OK, type: OrderResponseDto })
  async buyerConfirmReceived(@CurrentUser() user: ReqUser, @Param('id') orderId: string) {
    return this.ordersService.buyerConfirmReceived(orderId, user.sub);
  }

  /**
   * Hủy đơn hàng
   */
  @Post(':id/cancel')
  @ApiOperation({
    summary: 'Hủy đơn hàng',
    description: 'Hủy đơn (chỉ khi PENDING hoặc WAITING_SELLER_CONFIRM)',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: HttpStatus.OK, type: OrderResponseDto })
  async cancelOrder(
    @CurrentUser() user: ReqUser,
    @Param('id') orderId: string,
    @Body('note') note?: string,
  ) {
    return this.ordersService.cancelOrder(orderId, user.sub, note);
  }

  /**
   * Tạo tranh chấp
   */
  @Post(':id/dispute')
  @ApiOperation({
    summary: 'Tạo tranh chấp',
    description: 'Báo cáo tranh chấp khi đơn hàng đang giao',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: HttpStatus.OK, type: OrderResponseDto })
  async createDispute(
    @CurrentUser() user: ReqUser,
    @Param('id') orderId: string,
    @Body('note') note: string,
  ) {
    return this.ordersService.createDispute(orderId, user.sub, note);
  }

  /**
   * Lấy chi tiết đơn hàng
   */
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết đơn hàng' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: HttpStatus.OK, type: OrderWithRelationsDto })
  async findOne(@Param('id') orderId: string) {
    return this.ordersService.findOne(orderId);
  }

  /**
   * Lấy đơn hàng theo code
   */
  @Get('code/:code')
  @ApiOperation({ summary: 'Lấy đơn hàng theo mã' })
  @ApiParam({ name: 'code', description: 'Order code (VD: ORD-12345)' })
  @ApiResponse({ status: HttpStatus.OK, type: OrderWithRelationsDto })
  async findByCode(@Param('code') code: string) {
    return this.ordersService.findByCode(code);
  }

  /**
   * Lấy đơn hàng của tôi
   */
  @Get('my/orders')
  @ApiOperation({ summary: 'Lấy đơn hàng của tôi' })
  @ApiQuery({ name: 'role', enum: ['buyer', 'seller', 'all'], required: false })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiResponse({ status: HttpStatus.OK, type: [OrderWithRelationsDto] })
  async findMyOrders(
    @CurrentUser() user: ReqUser,
    @Query('role') role: 'buyer' | 'seller' | 'all' = 'all',
    @Query('status') status?: OrderStatus,
  ) {
    return this.ordersService.findByUser(user.sub, role, status);
  }

  /**
   * Admin: Lấy tất cả đơn hàng
   */
  @Get()
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Lấy tất cả đơn hàng' })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiResponse({ status: HttpStatus.OK, type: [OrderWithRelationsDto] })
  async findAll(@Query('status') status?: OrderStatus) {
    return this.ordersService.findAll(status);
  }
}
