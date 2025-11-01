import { Controller, Get, Post, Body, Patch, Param, Delete, UnauthorizedException, UseGuards } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import { UpdateRefundDto } from './dto/update-refund.dto';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { ReqUser } from '../../core/decorators/current-user.decorator';
import { RefundRequestDto } from './dto/refund-request.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';


@UseGuards(JwtAuthGuard)
@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  async handleRefund(@Body() dto: RefundRequestDto, @CurrentUser() user: ReqUser) {
    if (user.role == null) {
      throw new UnauthorizedException('User role is missing');
    }
    return this.refundsService.handleRefund(dto, { id: user.sub, role: user.role });
  }
}
