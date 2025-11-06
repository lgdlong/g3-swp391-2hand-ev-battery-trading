import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { ConfirmContractDto } from './dto/confirm-contract.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateContractBySellerDto } from './dto/create-contract-by-seller.dto';
import { ContractResponseDto } from './dto/contract-response.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { ReqUser } from '../../core/decorators/current-user.decorator';
import { Contract } from './entities/contract.entity';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo hợp đồng mua hàng (Buyer)' })
  @ApiOkResponse({
    description: 'Tạo hợp đồng thành công',
    type: ContractResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bài đăng' })
  @ApiBadRequestResponse({ description: 'Bài đăng không hợp lệ hoặc đã có hợp đồng' })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @Post('contracts')
  async createContract(
    @Body() dto: CreateContractDto,
    @CurrentUser() user: ReqUser,
  ): Promise<Contract> {
    return this.transactionsService.createContract(dto.listingId, user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo hợp đồng bởi Seller (Chốt đơn)' })
  @ApiOkResponse({
    description: 'Chốt đơn thành công',
    type: ContractResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bài đăng' })
  @ApiBadRequestResponse({ description: 'Bài đăng không hợp lệ hoặc đã có hợp đồng' })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @ApiForbiddenResponse({ description: 'Chỉ seller mới có thể chốt đơn' })
  @Post('contracts/seller')
  async createContractBySeller(
    @Body() dto: CreateContractBySellerDto,
    @CurrentUser() user: ReqUser,
  ): Promise<Contract> {
    return this.transactionsService.createContractBySeller(dto.listingId, user.sub, dto.buyerId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy hợp đồng của buyer cho một bài đăng' })
  @ApiParam({ name: 'listingId', type: String, description: 'Post/Listing ID' })
  @ApiOkResponse({
    description: 'Hợp đồng của buyer (có thể null nếu chưa có hợp đồng)',
    type: ContractResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bài đăng' })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @Get('contracts/by-listing/:listingId/buyer')
  async getContractByBuyerAndListing(
    @Param('listingId') listingId: string,
    @CurrentUser() user: ReqUser,
  ): Promise<Contract | null> {
    return this.transactionsService.getContractByBuyerAndListing(listingId, user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy hợp đồng theo bài đăng và buyer (Seller only)' })
  @ApiParam({ name: 'listingId', type: String, description: 'Post/Listing ID' })
  @ApiParam({ name: 'buyerId', type: Number, description: 'Buyer ID' })
  @ApiOkResponse({
    description: 'Hợp đồng (có thể null nếu chưa có)',
    type: ContractResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bài đăng' })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @ApiForbiddenResponse({ description: 'Chỉ seller mới có thể xem hợp đồng của bài đăng này' })
  @Get('contracts/by-listing/:listingId/buyer/:buyerId')
  async getContractByListingAndBuyer(
    @Param('listingId') listingId: string,
    @Param('buyerId') buyerId: number,
    @CurrentUser() user: ReqUser,
  ): Promise<Contract | null> {
    return this.transactionsService.getContractByListingAndBuyer(listingId, buyerId, user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách hợp đồng theo bài đăng (Seller only)' })
  @ApiParam({ name: 'listingId', type: String, description: 'Post/Listing ID' })
  @ApiOkResponse({
    description: 'Danh sách hợp đồng',
    type: [ContractResponseDto],
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bài đăng' })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @ApiForbiddenResponse({ description: 'Chỉ seller mới có thể xem hợp đồng của bài đăng này' })
  @Get('contracts/by-listing/:listingId')
  async getContractsByListing(
    @Param('listingId') listingId: string,
    @CurrentUser() user: ReqUser,
  ): Promise<Contract[]> {
    return this.transactionsService.getContractsByListingId(listingId, user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy tất cả hợp đồng của seller' })
  @ApiOkResponse({
    description: 'Danh sách hợp đồng của seller',
    type: [ContractResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @Get('contracts/seller')
  async getSellerContracts(@CurrentUser() user: ReqUser): Promise<Contract[]> {
    return this.transactionsService.getSellerContracts(user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy tất cả hợp đồng của buyer' })
  @ApiOkResponse({
    description: 'Danh sách hợp đồng của buyer',
    type: [ContractResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @Get('contracts/buyer')
  async getBuyerContracts(@CurrentUser() user: ReqUser): Promise<Contract[]> {
    return this.transactionsService.getBuyerContracts(user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin hợp đồng' })
  @ApiParam({ name: 'id', type: String, description: 'Contract ID' })
  @ApiOkResponse({
    description: 'Thông tin hợp đồng',
    type: ContractResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy hợp đồng' })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @ApiForbiddenResponse({ description: 'Không có quyền xem hợp đồng này' })
  @Get('contracts/:id')
  async getContract(
    @Param('id') contractId: string,
    @CurrentUser() user: ReqUser,
  ): Promise<Contract> {
    return this.transactionsService.getContract(contractId, user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buyer xác nhận đã nhận hàng' })
  @ApiParam({ name: 'id', type: String, description: 'Contract ID' })
  @ApiOkResponse({
    description: 'Xác nhận thành công',
    type: ContractResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy hợp đồng' })
  @ApiBadRequestResponse({ description: 'Hợp đồng không ở trạng thái hợp lệ hoặc đã xác nhận' })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @ApiForbiddenResponse({ description: 'Chỉ buyer mới có thể xác nhận' })
  @Post('contracts/:id/buyer/confirm')
  async confirmByBuyer(
    @Param('id') contractId: string,
    @Body() dto: ConfirmContractDto,
    @CurrentUser() user: ReqUser,
  ): Promise<Contract> {
    return this.transactionsService.confirmByBuyer(contractId, user.sub, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seller xác nhận đã giao hàng' })
  @ApiParam({ name: 'id', type: String, description: 'Contract ID' })
  @ApiOkResponse({
    description: 'Xác nhận thành công',
    type: ContractResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy hợp đồng' })
  @ApiBadRequestResponse({ description: 'Hợp đồng không ở trạng thái hợp lệ hoặc đã xác nhận' })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @ApiForbiddenResponse({ description: 'Chỉ seller mới có thể xác nhận' })
  @Post('contracts/:id/seller/confirm')
  async confirmBySeller(
    @Param('id') contractId: string,
    @Body() dto: ConfirmContractDto,
    @CurrentUser() user: ReqUser,
  ): Promise<Contract> {
    return this.transactionsService.confirmBySeller(contractId, user.sub, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seller báo bán ngoài hệ thống' })
  @ApiParam({ name: 'id', type: String, description: 'Contract ID' })
  @ApiOkResponse({
    description: 'Báo bán ngoài hệ thống thành công',
    type: ContractResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy hợp đồng' })
  @ApiBadRequestResponse({ description: 'Hợp đồng không ở trạng thái hợp lệ' })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @ApiForbiddenResponse({ description: 'Chỉ seller mới có thể báo bán ngoài hệ thống' })
  @Post('contracts/:id/seller/forfeit-external')
  async forfeitExternal(
    @Param('id') contractId: string,
    @CurrentUser() user: ReqUser,
  ): Promise<Contract> {
    return this.transactionsService.forfeitExternal(contractId, user.sub);
  }
}
