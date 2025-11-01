import { Controller, Get, Post, Body, Patch, Param, Delete, UnauthorizedException, UseGuards } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import { UpdateRefundDto } from './dto/update-refund.dto';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { ReqUser } from '../../core/decorators/current-user.decorator';
import { RefundRequestDto } from './dto/refund-request.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { AccountRole } from 'src/shared/enums/account-role.enum';
import { RolesGuard } from 'src/core/guards/roles.guard';


@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}



  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @Post()
  async handleRefund(@Body() dto: RefundRequestDto) {
    return this.refundsService.handleRefund(dto);
  }
}
