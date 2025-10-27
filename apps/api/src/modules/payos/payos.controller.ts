import { Controller, Get, Post, Body, Param, Res, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { PayosService } from './payos.service';
import {
  CreatePayosDto,
  CancelPaymentDto,
  WebhookPayosDto,
  PayosCreatePaymentResponse,
  PayosGetPaymentResponse,
  PayosCancelPaymentResponse,
  WebhookResponse,
} from './dto';

@ApiTags('PayOS - Payment Gateway')
@Controller('payos')
export class PayosController {
  constructor(private readonly payosService: PayosService) {}

  @Post()
  @ApiOperation({
    summary: 'Create payment link',
    description:
      'Creates a new payment link using PayOS payment gateway for EV battery transactions',
  })
  @ApiBody({
    type: CreatePayosDto,
    description: 'Payment creation data including order details and redirect URLs',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment link created successfully',
    type: PayosCreatePaymentResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or missing required fields',
  })
  @ApiInternalServerErrorResponse({
    description: 'PayOS API error or server error',
  })
  create(@Body() createPayOSDto: CreatePayosDto): Promise<PayosCreatePaymentResponse> {
    return this.payosService.create(createPayOSDto);
  }

  @Get(':orderCode')
  @ApiOperation({
    summary: 'Get payment information',
    description: 'Retrieves payment status and details by order code from PayOS',
  })
  @ApiParam({
    name: 'orderCode',
    description: 'Unique order code for the payment',
    example: '123456789',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment information retrieved successfully',
    type: PayosGetPaymentResponse,
  })
  @ApiNotFoundResponse({
    description: 'Payment not found with the provided order code',
  })
  @ApiInternalServerErrorResponse({
    description: 'PayOS API error or server error',
  })
  find(@Param('orderCode') orderCode: string): Promise<PayosGetPaymentResponse> {
    return this.payosService.find(+orderCode);
  }

  @Post(':orderCode/cancel')
  @ApiOperation({
    summary: 'Cancel payment',
    description: 'Cancels an existing payment by order code with optional reason',
  })
  @ApiParam({
    name: 'orderCode',
    description: 'Unique order code for the payment to cancel',
    example: '123456789',
    type: 'string',
  })
  @ApiBody({
    type: CancelPaymentDto,
    description: 'Cancellation details including optional reason',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment cancelled successfully',
    type: PayosCancelPaymentResponse,
  })
  @ApiNotFoundResponse({
    description: 'Payment not found with the provided order code',
  })
  @ApiBadRequestResponse({
    description: 'Payment cannot be cancelled (already paid or cancelled)',
  })
  @ApiInternalServerErrorResponse({
    description: 'PayOS API error or server error',
  })
  cancel(
    @Param('orderCode') orderCode: string,
    @Body() body: CancelPaymentDto,
  ): Promise<PayosCancelPaymentResponse> {
    return this.payosService.cancel(+orderCode, body.reason);
  }

  @Post('webhook')
  @ApiOperation({
    summary: 'PayOS webhook endpoint',
    description:
      'Receives payment status updates from PayOS webhook notifications. This endpoint is called by PayOS when payment status changes.',
  })
  @ApiBody({
    type: WebhookPayosDto,
    description: 'Webhook payload from PayOS containing payment status updates',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook processed successfully',
    type: WebhookResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid webhook payload or signature verification failed',
  })
  webhook(@Body() webhookPayosDto: WebhookPayosDto, @Res() res: Response) {
    this.payosService.handleWebhook(webhookPayosDto);
    // return res.status(200).send('Webhook received');
  }
}
