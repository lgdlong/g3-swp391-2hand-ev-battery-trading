import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { BuyNowDto, SellerConfirmDto, OrderResponseDto, OrderWithRelationsDto } from './dto';
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
   * API 1: Mua ngay - Buyer đặt mua + trừ tiền + lock post
   */
  @Post('buy-now')
  @ApiOperation({
    summary: 'Mua ngay',
    description: 'Buyer đặt mua, trừ tiền ví (BUY_HOLD), lock bài đăng',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: OrderResponseDto })
  async buyNow(@CurrentUser() user: ReqUser, @Body() dto: BuyNowDto) {
    return this.ordersService.buyNow(user.sub, dto);
  }

  /**
   * API 2: Seller xác nhận (ACCEPT/REJECT)
   */
  @Put(':id/confirm')
  @ApiOperation({
    summary: 'Seller xác nhận đơn',
    description: 'ACCEPT: chuyển sang giao hàng | REJECT: hoàn tiền buyer, mở lại post',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: HttpStatus.OK, type: OrderResponseDto })
  async sellerConfirm(
    @CurrentUser() user: ReqUser,
    @Param('id') orderId: string,
    @Body() dto: SellerConfirmDto,
  ) {
    return this.ordersService.sellerConfirm(orderId, user.sub, dto);
  }

  /**
   * API 3: Hoàn tất đơn hàng - Buyer xác nhận đã nhận hàng
   */
  @Put(':id/complete')
  @ApiOperation({
    summary: 'Hoàn tất đơn hàng',
    description: 'Buyer xác nhận nhận hàng, chuyển tiền cho seller (trừ 2% commission)',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: HttpStatus.OK, type: OrderResponseDto })
  async completeOrder(@CurrentUser() user: ReqUser, @Param('id') orderId: string) {
    return this.ordersService.completeOrder(orderId, user.sub);
  }

  /**
   * Hủy đơn hàng
   */
  @Put(':id/cancel')
  @ApiOperation({
    summary: 'Hủy đơn hàng',
    description: 'Buyer hủy đơn (chỉ khi WAITING_SELLER_CONFIRM), hoàn tiền',
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
   * Lấy đơn hàng của tôi
   */
  @Get('my')
  @ApiOperation({ summary: 'Lấy đơn hàng của tôi' })
  @ApiQuery({ name: 'role', enum: ['buyer', 'seller', 'all'], required: false })
  @ApiQuery({
    name: 'status',
    enum: OrderStatus,
    enumName: 'OrderStatus',
    required: false,
  })
  @ApiResponse({ status: HttpStatus.OK, type: [OrderWithRelationsDto] })
  async findMyOrders(
    @CurrentUser() user: ReqUser,
    @Query('role') role: 'buyer' | 'seller' | 'all' = 'all',
    @Query('status') status?: OrderStatus,
  ) {
    return this.ordersService.findByUser(user.sub, role, status);
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
   * Admin: Lấy tất cả đơn hàng
   */
  @Get()
  @Roles(AccountRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Lấy tất cả đơn hàng' })
  @ApiQuery({
    name: 'status',
    enum: OrderStatus,
    enumName: 'OrderStatus',
    required: false,
  })
  @ApiResponse({ status: HttpStatus.OK, type: [OrderWithRelationsDto] })
  async findAll(@Query('status') status?: OrderStatus) {
    return this.ordersService.findAll(status);
  }
}
