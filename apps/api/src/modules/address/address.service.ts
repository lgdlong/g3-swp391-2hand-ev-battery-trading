// address.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AddressApiResponse } from './interfaces/address.interface';

@Injectable()
export class AddressService {
  private readonly BASE_URL: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.BASE_URL =
      this.configService.get<string>('ADDRESS_API_BASE_URL') ?? 'https://tinhthanhpho.com/api/v1';
  }

  async getFullAddressByWardCode(wardCode: string): Promise<AddressApiResponse> {
    const url = `${this.BASE_URL}/full-address?wardCode=${wardCode}`;
    try {
      const response = await this.httpService.axiosRef.get<AddressApiResponse>(url);
      if (response?.data) {
        return response.data;
      }
      throw new Error('Không nhận được dữ liệu từ API địa chỉ');
    } catch (error) {
      throw new Error(`Lấy địa chỉ thất bại: ${(error as Error).message}`);
    }
  }
}
