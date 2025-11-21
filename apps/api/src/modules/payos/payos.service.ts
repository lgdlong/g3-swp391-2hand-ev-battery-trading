import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreatePayosDto,
  PayosCancelPaymentResponse,
  PayosCreatePaymentResponse,
  PayosGetPaymentResponse,
  WebhookPayosDto,
} from './dto';
import { PaymentOrder } from './entities/payment-order.entity';
import { PayosWebhookLog } from './entities/payos-webhook-log.entity';
import { PaymentStatus } from '../../shared/enums/payment-status.enum';
import { WebhookProcessingStatus } from '../../shared/enums/webhook-processing-status.enum';
import { createHmac } from 'crypto';
import axios from 'axios';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class PayosService {
  private readonly payosBaseUrl = process.env.PAYOS_BASE_URL;
  private readonly payosClientId = process.env.PAYOS_CLIENT_ID || '';
  private readonly payosApiKey = process.env.PAYOS_API_KEY || '';
  private readonly payosChecksumKey = process.env.PAYOS_CHECKSUM_KEY;

  constructor(
    @InjectRepository(PaymentOrder)
    private readonly paymentOrderRepo: Repository<PaymentOrder>,
    @InjectRepository(PayosWebhookLog)
    private readonly webhookLogRepo: Repository<PayosWebhookLog>,
    @Inject(forwardRef(() => WalletsService))
    private readonly walletsService: WalletsService,
  ) {}

  private signcreate(createPayosDto: CreatePayosDto) {
    const str = `amount=${createPayosDto.amount}&cancelUrl=${createPayosDto.cancelUrl}&description=${createPayosDto.description}&orderCode=${createPayosDto.orderCode}&returnUrl=${createPayosDto.returnUrl}`;
    if (!this.payosChecksumKey) {
      throw new Error('PAYOS_CHECKSUM_KEY chưa được cấu hình');
    }
    return createHmac('sha256', this.payosChecksumKey).update(str).digest('hex');
  }

  async create(createPayOSDto: CreatePayosDto): Promise<PayosCreatePaymentResponse> {
    const signature = this.signcreate(createPayOSDto);
    const res = await axios.post(
      `${this.payosBaseUrl}/v2/payment-requests`,
      {
        ...createPayOSDto,
        signature,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': this.payosClientId,
          'x-api-key': this.payosApiKey,
        },
      },
    );

    return res.data;
  }

  async find(orderCode: number | string): Promise<PayosGetPaymentResponse> {
    const res = await axios.get(`${this.payosBaseUrl}/v2/payment-requests/${orderCode}`, {
      headers: {
        'x-client-id': this.payosClientId,
        'x-api-key': this.payosApiKey,
      },
    });
    return res.data;
  }

  async cancel(orderCode: number, reason?: string): Promise<PayosCancelPaymentResponse> {
    const res = await axios.post(
      `${this.payosBaseUrl}/v2/payment-requests/${orderCode}/cancel`,
      {
        orderCode,
        cancellationReason: reason || 'No reason provided',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': this.payosClientId,
          'x-api-key': this.payosApiKey,
        },
      },
    );
    return res.data;
  }

  /**
   * Handle PayOS webhook for payment status updates
   * @param webhookDto - Webhook payload from PayOS
   */
  async handleWebhook(webhookDto: WebhookPayosDto): Promise<void> {
    // Log the webhook
    const webhookLog = this.webhookLogRepo.create({
      payload: webhookDto,
      signature: webhookDto.signature,
      isSignatureValid: true, // TODO: Implement signature verification
      orderCode: webhookDto.data.orderCode.toString(),
      paymentLinkId: webhookDto.data.paymentLinkId || null,
      transactionRef: webhookDto.data.reference || null,
      transactionStatus: webhookDto.data.code || null,
      amount: webhookDto.data.amount?.toString() || null,
      processingStatus: WebhookProcessingStatus.RECEIVED,
      transactionTime: new Date(webhookDto.data.transactionDateTime || new Date()),
    });
    await this.webhookLogRepo.save(webhookLog);

    try {
      // Find payment order by orderCode (which is the payment order ID)
      const orderCode = webhookDto.data.orderCode.toString();
      const paymentOrder = await this.paymentOrderRepo.findOne({
        where: { id: orderCode },
        relations: ['serviceType'],
      });

      if (!paymentOrder) {
        console.error(`Payment order not found for ID: ${orderCode}`);
        webhookLog.processingStatus = WebhookProcessingStatus.FAILED;
        webhookLog.processingNotes = `Payment order not found for ID: ${orderCode}`;
        await this.webhookLogRepo.save(webhookLog);
        return;
      }

      // Check if payment was successful
      if (webhookDto.code === '00' && webhookDto.data.code === '00') {
        // Update payment order status
        paymentOrder.status = PaymentStatus.COMPLETED;
        paymentOrder.paidAt = new Date();
        await this.paymentOrderRepo.save(paymentOrder);

        // Handle wallet topup if this is a wallet topup payment
        if (paymentOrder.serviceType.code === 'WALLET_TOPUP') {
          try {
            await this.walletsService.processCompletedPayment(paymentOrder.id);
          } catch (error) {
            console.error('Error processing wallet topup:', error);
            // Don't fail the webhook processing if wallet topup fails
          }
        }

        webhookLog.processingStatus = WebhookProcessingStatus.PROCESSED;
        webhookLog.processingNotes = 'Payment completed successfully';
      } else {
        // Payment failed or cancelled
        paymentOrder.status = PaymentStatus.FAILED;
        await this.paymentOrderRepo.save(paymentOrder);

        webhookLog.processingStatus = WebhookProcessingStatus.PROCESSED;
        webhookLog.processingNotes = `Payment failed: ${webhookDto.desc}`;
      }

      await this.webhookLogRepo.save(webhookLog);
    } catch (error) {
      console.error('Error processing webhook:', error);
      webhookLog.processingStatus = WebhookProcessingStatus.FAILED;
      webhookLog.processingNotes = error instanceof Error ? error.message : 'Unknown error';
      await this.webhookLogRepo.save(webhookLog);
    }
  }
}
