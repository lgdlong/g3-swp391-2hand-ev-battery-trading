import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCarBrands, getBikeBrands, getCarModels, getBikeModels } from '@/lib/api/catalogApi';
import { Post, CarDetail, BikeDetail } from '@/types/post';
import { Origin } from '@/types/enums';
import { getFlexibleFieldValue } from '../utils/utils';

export function useEVFormState(post: Post) {
  const isEVPost = post.postType === 'EV_CAR' || post.postType === 'EV_BIKE';
  const isCarPost = post.postType === 'EV_CAR';

  const [evFormData, setEvFormData] = useState(() => {
    if (post.postType === 'EV_CAR' || post.postType === 'EV_BIKE') {
      const detail = post.postType === 'EV_CAR' ? post.carDetails : post.bikeDetails;
      return {
        vehicleType: post.postType === 'EV_CAR' ? ('xe_hoi' as const) : ('xe_may' as const),
        brandId: getFlexibleFieldValue(detail?.brand_id) || '',
        modelId: getFlexibleFieldValue(detail?.model_id) || '',
        manufactureYear: getFlexibleFieldValue(detail?.manufacture_year) || '',
        bodyStyle:
          ((post.postType === 'EV_CAR' ? (detail as CarDetail)?.body_style : 'SEDAN') as
            | 'SEDAN'
            | 'SUV'
            | 'HATCHBACK'
            | 'COUPE'
            | 'OTHER') || 'SEDAN',
        bikeStyle:
          ((post.postType === 'EV_BIKE' ? (detail as BikeDetail)?.bike_style : 'SCOOTER') as
            | 'SCOOTER'
            | 'UNDERBONE'
            | 'MOTORCYCLE'
            | 'MOPED'
            | 'OTHER') || 'SCOOTER',
        origin: (detail?.origin as Origin) || Origin.NOI_DIA,
        color: (detail?.color as 'BLACK' | 'WHITE' | 'RED' | 'BLUE' | 'SILVER') || 'BLACK',
        seats:
          post.postType === 'EV_CAR'
            ? getFlexibleFieldValue((detail as CarDetail)?.seats) || ''
            : '2',
        trimName: '',
        licensePlate: getFlexibleFieldValue(detail?.license_plate) || '',
        ownersCount: getFlexibleFieldValue(detail?.owners_count) || '',
        odoKm: getFlexibleFieldValue(detail?.odo_km) || '',
        batteryCapacityKwh: getFlexibleFieldValue(detail?.battery_capacity_kwh) || '',
        rangeKm: getFlexibleFieldValue(detail?.range_km) || '',
        chargeAcKw: getFlexibleFieldValue(detail?.charge_ac_kw) || '',
        chargeDcKw:
          post.postType === 'EV_CAR'
            ? getFlexibleFieldValue((detail as CarDetail)?.charge_dc_kw) || ''
            : '',
        motorPowerKw:
          post.postType === 'EV_BIKE'
            ? getFlexibleFieldValue((detail as BikeDetail)?.motor_power_kw) || ''
            : '',
        batteryHealthPct: getFlexibleFieldValue(detail?.battery_health_pct) || '',
        hasBundledBattery:
          post.postType === 'EV_CAR' ? ((detail as CarDetail)?.has_bundled_battery ?? false) : false,
      };
    }
    return {
      vehicleType: 'xe_hoi' as const,
      brandId: '',
      modelId: '',
      manufactureYear: '',
      bodyStyle: 'SEDAN' as const,
      bikeStyle: 'SCOOTER' as const,
      origin: Origin.NOI_DIA,
      color: 'BLACK' as const,
      seats: '',
      trimName: '',
      licensePlate: '',
      ownersCount: '',
      odoKm: '',
      batteryCapacityKwh: '',
      rangeKm: '',
      chargeAcKw: '',
      chargeDcKw: '',
      motorPowerKw: '',
      batteryHealthPct: '',
      hasBundledBattery: false,
    };
  });

  const { data: brands = [], isLoading: loadingBrands } = useQuery({
    queryKey: isCarPost ? ['car-brands'] : ['bike-brands'],
    queryFn: isCarPost ? getCarBrands : getBikeBrands,
    enabled: isEVPost,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: models = [], isLoading: loadingModels } = useQuery({
    queryKey: [isCarPost ? 'car-models' : 'bike-models', evFormData.brandId],
    queryFn: () =>
      isCarPost
        ? getCarModels(parseInt(evFormData.brandId))
        : getBikeModels(parseInt(evFormData.brandId)),
    enabled: isEVPost && !!evFormData.brandId && evFormData.brandId !== 'other',
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  return {
    evFormData,
    setEvFormData,
    brands,
    models,
    loadingBrands,
    loadingModels,
    isEVPost,
    isCarPost,
  };
}
