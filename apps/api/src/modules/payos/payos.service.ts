import { Injectable } from '@nestjs/common';
import { CreatePayoDto } from './dto/create-payo.dto';
import { createHmac } from 'crypto';
import axios from 'axios';
@Injectable()
export class PayosService {

  private signcreate(createPayosDto: CreatePayoDto) {
    const str = `amount=${createPayosDto.amount}&cancelUrl=${createPayosDto.cancelUrl}&description=${createPayosDto.description}&orderCode=${createPayosDto.orderCode}&returnUrl=${createPayosDto.returnUrl}`;
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
    if (!checksumKey) {
      throw new Error('PAYOS_CHECKSUM_KEY is not configured');
    }
    return createHmac('sha256', checksumKey).update(str).digest('hex');
  }

  async create(createPayoDto: CreatePayoDto) {
    const signature = this.signcreate(createPayoDto);
    console.log('Creating PayO payment request with data:', {...createPayoDto, signature});
    const res = await fetch(`${process.env.PAYOS_BASE_URL}/v2/payment-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.PAYOS_CLIENT_ID || '',
        'x-api-key': process.env.PAYOS_API_KEY || '', 
      },
      body: JSON.stringify({
        ...createPayoDto,
        signature,
      }),
    });

    return res.json();

  }


  async find(orderCode: number | string) {
    const res = await axios.get(`${process.env.PAYOS_BASE_URL}/v2/payment-requests/${orderCode}`, {
      headers: {
        'x-client-id': process.env.PAYOS_CLIENT_ID || '',
        'x-api-key': process.env.PAYOS_API_KEY || '',
      },
    });
   const payosData = res.data.data;
    return  payosData;
  }


  async cancel(orderCode: number, reason?: string) {
    const res = await axios.post(`${process.env.PAYOS_BASE_URL}/v2/payment-requests/${orderCode}/cancel`, {
      orderCode,
      cancellationReason: reason || 'No reason provided',
    },{
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.PAYOS_CLIENT_ID || '',
        'x-api-key': process.env.PAYOS_API_KEY || '',
      }
    });
    return res.data;
  }
}
