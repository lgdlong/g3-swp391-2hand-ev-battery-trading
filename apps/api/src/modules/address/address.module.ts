import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AddressService } from './address.service';

@Module({
  imports: [HttpModule],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
