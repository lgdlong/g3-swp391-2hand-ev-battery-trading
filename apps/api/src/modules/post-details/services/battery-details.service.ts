import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { PostBatteryDetails } from '../entities/post-battery-details.entity';

@Injectable()
export class BatteryDetailsService {
  constructor(
    @InjectRepository(PostBatteryDetails)
    private readonly repo: Repository<PostBatteryDetails>,
  ) {}
}
