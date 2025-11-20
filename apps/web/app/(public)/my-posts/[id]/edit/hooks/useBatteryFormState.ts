import { useState } from 'react';
import { Post } from '@/types/post';
import { BatteryFormData } from '@/types/form-data';
import { BatteryChemistry, Origin } from '@/types/enums';

export function useBatteryFormState(post: Post) {
  const [batteryFormData, setBatteryFormData] = useState<BatteryFormData>(() => {
    if (post.postType === 'BATTERY') {
      const detail = post.batteryDetails;
      return {
        brandId: detail?.brandId?.toString() || '',
        voltageV: detail?.voltageV?.toString() || '',
        capacityAh: detail?.capacityAh?.toString() || '',
        chargeTimeHours: detail?.chargeTimeHours?.toString() || '',
        chemistry: (detail?.chemistry as BatteryChemistry) || '',
        origin: (detail?.origin as Origin) || Origin.NOI_DIA,
        weightKg: detail?.weightKg?.toString() || '',
        cycleLife: detail?.cycleLife?.toString() || '',
        rangeKm: detail?.rangeKm?.toString() || '',
        compatibleNotes: detail?.compatibleNotes || '',
      };
    }
    return {
      brandId: '',
      voltageV: '',
      capacityAh: '',
      chargeTimeHours: '',
      chemistry: '',
      origin: Origin.NOI_DIA,
      weightKg: '',
      cycleLife: '',
      rangeKm: '',
      compatibleNotes: '',
    };
  });

  return {
    batteryFormData,
    setBatteryFormData,
  };
}
