import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { PostBatteryDetails } from '../entities/post-battery-details.entity';
import { CreateBatteryDetailsDto } from '../dto/battery/create-battery-details.dto';
import { Origin } from 'src/shared/enums/vehicle.enum';
import { OriginEnum } from 'src/shared/enums/battery.enum';

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
      brandId: data.brand_id ?? null,
      voltageV: data.voltageV ?? null,
      capacityAh: data.capacityAh ?? null,
      chargeTimeHours: data.chargeTimeHours ?? null,
      chemistry: data.chemistry ?? null,
      origin: data.origin ? (data.origin as unknown as Origin) : null, // Map OriginEnum to Origin
      weightKg: data.weightKg ?? null,
      cycleLife: data.cycleLife ?? null,
      rangeKm: data.rangeKm ?? null,
      compatibleNotes: data.compatibleNotes ?? null,
    });

    return trx.save(PostBatteryDetails, detail);
  }

  /**
   * Update battery details within a transaction
   */
  async updateWithTrx(
    trx: EntityManager,
    postId: string,
    patch: Partial<CreateBatteryDetailsDto>,
  ): Promise<PostBatteryDetails | null> {
    const updateFields: Partial<PostBatteryDetails> = {};

    if (patch.brand_id !== undefined) {
      updateFields.brandId = patch.brand_id ?? null;
    }
    if (patch.voltageV !== undefined) updateFields.voltageV = patch.voltageV;
    if (patch.capacityAh !== undefined) updateFields.capacityAh = patch.capacityAh;
    if (patch.chargeTimeHours !== undefined) updateFields.chargeTimeHours = patch.chargeTimeHours;
    if (patch.chemistry !== undefined) updateFields.chemistry = patch.chemistry;
    if (patch.origin !== undefined) {
      updateFields.origin = patch.origin ? (patch.origin as unknown as Origin) : null;
    }
    if (patch.weightKg !== undefined) updateFields.weightKg = patch.weightKg;
    if (patch.cycleLife !== undefined) updateFields.cycleLife = patch.cycleLife;
    if (patch.rangeKm !== undefined) updateFields.rangeKm = patch.rangeKm;
    if (patch.compatibleNotes !== undefined) updateFields.compatibleNotes = patch.compatibleNotes;

    if (Object.keys(updateFields).length > 0) {
      await trx.update(PostBatteryDetails, { postId }, updateFields);
    }

    return trx.findOneBy(PostBatteryDetails, { postId });
  }
}
