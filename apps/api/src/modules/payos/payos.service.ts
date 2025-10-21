import { Injectable } from '@nestjs/common';
import { CreatePayosDto } from './dto';
import { createHmac } from 'crypto';
import axios from 'axios';

@Injectable()
export class PayosService {
  private readonly payosBaseUrl = process.env.PAYOS_BASE_URL;
  private readonly payosClientId = process.env.PAYOS_CLIENT_ID || '';
  private readonly payosApiKey = process.env.PAYOS_API_KEY || '';
  private readonly payosChecksumKey = process.env.PAYOS_CHECKSUM_KEY;

  private signcreate(createPayosDto: CreatePayosDto) {
    const str = `amount=${createPayosDto.amount}&cancelUrl=${createPayosDto.cancelUrl}&description=${createPayosDto.description}&orderCode=${createPayosDto.orderCode}&returnUrl=${createPayosDto.returnUrl}`;
    if (!this.payosChecksumKey) {
      throw new Error('PAYOS_CHECKSUM_KEY is not configured');
    }
    return createHmac('sha256', this.payosChecksumKey).update(str).digest('hex');
  }

  async create(createPayOSDto: CreatePayosDto) {
    const signature = this.signcreate(createPayOSDto);
    console.log('Creating PayO payment request with data:', { ...createPayOSDto, signature });
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

  async find(orderCode: number | string) {
    const res = await axios.get(`${this.payosBaseUrl}/v2/payment-requests/${orderCode}`, {
      headers: {
        'x-client-id': this.payosClientId,
        'x-api-key': this.payosApiKey,
      },
    });
    const payosData = res.data;
    return payosData;
  }

  async cancel(orderCode: number, reason?: string) {
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
}
