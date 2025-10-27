import { Controller, Post, Patch, Get, Param, Body, UseGuards } from '@nestjs/common';
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
import { VerifyPostService } from './verify-post.service';
import {
  RequestVerificationDto,
  ApproveVerificationDto,
  RejectVerificationDto,
} from './dto/verification.dto';
import { VerificationRequestResponseDto } from './dto/verification-request-response.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { AccountRole } from '../../shared/enums/account-role.enum';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { ReqUser } from '../../core/decorators/current-user.decorator';

@ApiTags('Post Verification')
@Controller('verify-post')
@UseGuards(JwtAuthGuard)
export class VerifyPostController {
  constructor(private readonly verifyPostService: VerifyPostService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yêu cầu kiểm định bài đăng (User/Seller only)' })
  @ApiParam({ name: 'postId', type: String, example: '123' })
  @ApiOkResponse({
    description: 'Yêu cầu kiểm định thành công',
    type: VerificationRequestResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bài đăng' })
  @ApiBadRequestResponse({ description: 'Bài đăng không hợp lệ hoặc đã được kiểm định' })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @ApiForbiddenResponse({ description: 'Không phải chủ bài đăng' })
  @Post(':postId/request')
  async requestVerification(
    @Param('postId') postId: string,
    @Body() dto: RequestVerificationDto,
    @CurrentUser() user: ReqUser,
  ): Promise<VerificationRequestResponseDto> {
    return this.verifyPostService.requestVerification(postId, user.sub, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Duyệt yêu cầu kiểm định (Admin only)' })
  @ApiParam({ name: 'postId', type: String, example: '123' })
  @ApiOkResponse({
    description: 'Duyệt kiểm định thành công',
    type: VerificationRequestResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy yêu cầu kiểm định' })
  @ApiBadRequestResponse({ description: 'Yêu cầu kiểm định không hợp lệ' })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @ApiForbiddenResponse({ description: 'Không đủ quyền admin' })
  @Patch(':postId/approve')
  @UseGuards(RolesGuard)
  @Roles(AccountRole.ADMIN)
  async approveVerification(
    @Param('postId') postId: string,
    @Body() dto: ApproveVerificationDto,
    @CurrentUser() user: ReqUser,
  ): Promise<VerificationRequestResponseDto> {
    return this.verifyPostService.approveVerification(postId, user.sub, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Từ chối yêu cầu kiểm định (Admin only)' })
  @ApiParam({ name: 'postId', type: String, example: '123' })
  @ApiOkResponse({
    description: 'Từ chối kiểm định thành công',
    type: VerificationRequestResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy yêu cầu kiểm định' })
  @ApiBadRequestResponse({ description: 'Yêu cầu kiểm định không hợp lệ' })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @ApiForbiddenResponse({ description: 'Không đủ quyền admin' })
  @Patch(':postId/reject')
  @UseGuards(RolesGuard)
  @Roles(AccountRole.ADMIN)
  async rejectVerification(
    @Param('postId') postId: string,
    @Body() dto: RejectVerificationDto,
    @CurrentUser() user: ReqUser,
  ): Promise<VerificationRequestResponseDto> {
    return this.verifyPostService.rejectVerification(postId, user.sub, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin yêu cầu kiểm định theo bài đăng' })
  @ApiParam({ name: 'postId', type: String, example: '123' })
  @ApiOkResponse({
    description: 'Thông tin yêu cầu kiểm định',
    type: VerificationRequestResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy yêu cầu kiểm định' })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @ApiForbiddenResponse({ description: 'Không có quyền xem yêu cầu kiểm định này' })
  @Get(':postId')
  async getVerificationRequest(
    @Param('postId') postId: string,
    @CurrentUser() user: ReqUser,
  ): Promise<VerificationRequestResponseDto | null> {
    return this.verifyPostService.getVerificationRequest(
      postId,
      user.sub,
      user.role as AccountRole,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu kiểm định đang chờ (Admin only)' })
  @ApiOkResponse({
    description: 'Danh sách yêu cầu kiểm định đang chờ',
    type: [VerificationRequestResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @ApiForbiddenResponse({ description: 'Không đủ quyền admin' })
  @Get('admin/pending')
  @UseGuards(RolesGuard)
  @Roles(AccountRole.ADMIN)
  async getPendingVerificationRequests(): Promise<VerificationRequestResponseDto[]> {
    return this.verifyPostService.getPendingVerificationRequests();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu kiểm định bị từ chối (Admin only)' })
  @ApiOkResponse({
    description: 'Danh sách yêu cầu kiểm định bị từ chối',
    type: [VerificationRequestResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @ApiForbiddenResponse({ description: 'Không đủ quyền admin' })
  @Get('admin/rejected')
  @UseGuards(RolesGuard)
  @Roles(AccountRole.ADMIN)
  async getRejectedVerificationRequests(): Promise<VerificationRequestResponseDto[]> {
    return this.verifyPostService.getRejectedVerificationRequests();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu kiểm định của người dùng hiện tại' })
  @ApiOkResponse({
    description: 'Danh sách yêu cầu kiểm định của người dùng',
    type: [VerificationRequestResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @Get('user/my-requests')
  async getMyVerificationRequests(
    @CurrentUser() user: ReqUser,
  ): Promise<VerificationRequestResponseDto[]> {
    return this.verifyPostService.getVerificationRequestsByUser(user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin yêu cầu kiểm định của bài đăng' })
  @ApiParam({ name: 'postId', type: String, example: '123' })
  @ApiOkResponse({
    description: 'Thông tin yêu cầu kiểm định',
    type: VerificationRequestResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy yêu cầu kiểm định' })
  @ApiUnauthorizedResponse({ description: 'Thiếu/không hợp lệ JWT' })
  @ApiForbiddenResponse({ description: 'Không có quyền xem yêu cầu kiểm định này' })
  @Get('post/:postId')
  async getVerificationRequestByPostId(
    @Param('postId') postId: string,
    @CurrentUser() user: ReqUser,
  ): Promise<VerificationRequestResponseDto | null> {
    return this.verifyPostService.getVerificationRequest(
      postId,
      user.sub,
      user.role as AccountRole,
    );
  }
}
