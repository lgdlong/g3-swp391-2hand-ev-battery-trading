import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { PostBatteryDetails } from '../entities/post-battery-details.entity';
import { CreateBatteryDetailsDto } from '../dto/battery/create-battery-details.dto';

@Injectable()
export class BatteryDetailsService {
  constructor(
    @InjectRepository(PostBatteryDetails)
    private readonly repo: Repository<PostBatteryDetails>,
  ) {}

  /**
   * Create battery details within a transaction
   */
  async createWithTrx(
    trx: EntityManager,
    data: CreateBatteryDetailsDto & { post_id: string },
  ): Promise<PostBatteryDetails> {
    const detail = trx.create(PostBatteryDetails, {
      postId: data.post_id,
      brand: data.brand_id ? { id: data.brand_id } : undefined,
      voltageV: data.voltageV ?? null,
      capacityAh: data.capacityAh ?? null,
      chargeTimeHours: data.chargeTimeHours ?? null,
      chemistry: data.chemistry ?? null,
      origin: data.origin ?? null,
      weightKg: data.weightKg ?? null,
      cycleLife: data.cycleLife ?? null,
      rangeKm: data.rangeKm ?? null,
      compatibleNotes: data.compatibleNotes ?? null,
    });

    return trx.save(PostBatteryDetails, detail);
  }
}
