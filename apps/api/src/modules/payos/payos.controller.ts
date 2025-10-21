import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { PayosService } from './payos.service';
import { CreatePayoDto } from './dto/create-payo.dto';
import { CancelPaymentDto } from './dto/cancel-payos.dto';
import { WebhookPayosDto } from './dto/webhook-event.dto';
import type { Response } from 'express';

@Controller('payos')
export class PayosController {
  constructor(private readonly payosService: PayosService) {}

  @Post()
  create(@Body() createPayoDto: CreatePayoDto) {
    return this.payosService.create(createPayoDto);
  }


  @Get(':orderCode')
  find(@Param('orderCode') orderCode: string) {
    return this.payosService.find(+orderCode);
  }

  @Post(':orderCode/cancel')
  cancel(@Param('orderCode') orderCode: string, @Body() body: CancelPaymentDto) {
    return this.payosService.cancel(+orderCode, body.reason);
  }

  @Post('webhook')
  webhook(@Body() webhookPayosDto: WebhookPayosDto, @Res() res: Response) {
    // this.payosService.handleWebhook(webhookPayosDto);
    return res.status(200).send('Webhook received');
  }
}