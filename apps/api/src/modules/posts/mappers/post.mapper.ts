import { Post } from '../entities/post.entity';
import { BasePostResponseDto } from '../dto/base-post-response.dto';
import { CarDetailsResponseDto } from '../../post-details/dto/car/car-details-response.dto';
import { BikeDetailsResponseDto } from '../../post-details/dto/bike/bike-details-response.dto';
import { BatteryDetailResponseDto } from '../../post-details/dto/battery/battery-detail-response.dto';
import { PostEvCarDetails } from 'src/modules/post-details/entities/post-ev-car-details.entity';
import { PostEvBikeDetails } from 'src/modules/post-details/entities/post-ev-bike-details.entity';
import { PostBatteryDetails } from 'src/modules/post-details/entities/post-battery-details.entity';
import { AccountMapper } from '../../accounts/mappers';
import { PostImageMapper } from './post-image.mapper';

export class PostMapper {
  static toBasePostResponseDto(post: Post): BasePostResponseDto {
    const dto = new BasePostResponseDto();

    // Basic post properties
    dto.id = post.id;
    dto.postType = post.postType;
    dto.title = post.title;
    dto.description = post.description;
    dto.wardCode = post.wardCode;
    dto.provinceNameCached = post.provinceNameCached;
    dto.districtNameCached = post.districtNameCached;
    dto.wardNameCached = post.wardNameCached;
    dto.addressTextCached = post.addressTextCached;
    dto.priceVnd = post.priceVnd;
    dto.isNegotiable = post.isNegotiable;
    dto.status = post.status;
    dto.submittedAt = post.submittedAt;
    dto.reviewedAt = post.reviewedAt;

    dto.createdAt = post.createdAt;
    dto.updatedAt = post.updatedAt;

    // Map seller if available
    if (post.seller) {
      dto.seller = AccountMapper.toSafeDto(post.seller);
    }

    // Map car details if available
    if (post.carDetails) {
      dto.carDetails = PostMapper.toCarDetailsResponseDto(post.carDetails);
    }

    // Map bike details if available
    if (post.bikeDetails) {
      dto.bikeDetails = PostMapper.toBikeDetailsResponseDto(post.bikeDetails);
    }

    // Map battery details if available
    if (post.batteryDetails) {
      dto.batteryDetails = PostMapper.toBatteryDetailsResponseDto(post.batteryDetails);
    }

    // Map images if available
    if (post.images) {
      dto.images = PostImageMapper.toResponseDtoArray(post.images);
    }

    // Map verification request if available
    if (post.verificationRequest) {
      dto.verificationRequest = {
        postId: post.verificationRequest.postId,
        requestedBy: post.verificationRequest.requestedBy,
        requestedAt: post.verificationRequest.requestedAt,
        status: post.verificationRequest.status,
        reviewedAt: post.verificationRequest.reviewedAt || undefined,
        rejectReason: post.verificationRequest.rejectReason || undefined,
        createdAt: post.verificationRequest.createdAt,
        updatedAt: post.verificationRequest.updatedAt,
      };
    }

    return dto;
  }

  static toBasePostResponseDtoArray(posts: Post[]): BasePostResponseDto[] {
    return posts.map((post) => PostMapper.toBasePostResponseDto(post));
  }

  private static toCarDetailsResponseDto(carDetails: PostEvCarDetails): CarDetailsResponseDto {
    const dto = new CarDetailsResponseDto();
    dto.brand_id = carDetails.brand_id;
    dto.model_id = carDetails.model_id;
    dto.manufacture_year = carDetails.manufacture_year;
    dto.body_style = carDetails.body_style;
    dto.origin = carDetails.origin;
    dto.color = carDetails.color;
    dto.seats = carDetails.seats;
    dto.license_plate = carDetails.license_plate;
    dto.owners_count = carDetails.owners_count;
    dto.odo_km = carDetails.odo_km;
    dto.battery_capacity_kwh = carDetails.battery_capacity_kwh;
    dto.range_km = carDetails.range_km;
    dto.charge_ac_kw = carDetails.charge_ac_kw;
    dto.charge_dc_kw = carDetails.charge_dc_kw;
    dto.battery_health_pct = carDetails.battery_health_pct;
    dto.has_bundled_battery = carDetails.has_bundled_battery;
    return dto;
  }

  private static toBikeDetailsResponseDto(bikeDetails: PostEvBikeDetails): BikeDetailsResponseDto {
    const dto = new BikeDetailsResponseDto();
    dto.brand_id = bikeDetails.brand_id;
    dto.model_id = bikeDetails.model_id;
    dto.manufacture_year = bikeDetails.manufacture_year;
    dto.bike_style = bikeDetails.bike_style;
    dto.origin = bikeDetails.origin;
    dto.color = bikeDetails.color;
    dto.license_plate = bikeDetails.license_plate;
    dto.owners_count = bikeDetails.owners_count;
    dto.odo_km = bikeDetails.odo_km;
    dto.battery_capacity_kwh = bikeDetails.battery_capacity_kwh;
    dto.range_km = bikeDetails.range_km;
    dto.motor_power_kw = bikeDetails.motor_power_kw;
    dto.charge_ac_kw = bikeDetails.charge_ac_kw;
    dto.battery_health_pct = bikeDetails.battery_health_pct;
    return dto;
  }

  private static toBatteryDetailsResponseDto(
    batteryDetails: PostBatteryDetails,
  ): BatteryDetailResponseDto {
    const dto = new BatteryDetailResponseDto();
    dto.brandId = batteryDetails.brandId || null;
    dto.voltageV = batteryDetails.voltageV ?? null;
    dto.capacityAh = batteryDetails.capacityAh ?? null;
    dto.chargeTimeHours = batteryDetails.chargeTimeHours ?? null;
    dto.chemistry = batteryDetails.chemistry ?? null;
    dto.origin = batteryDetails.origin ?? null;
    dto.weightKg = batteryDetails.weightKg ?? null;
    dto.cycleLife = batteryDetails.cycleLife ?? null;
    dto.rangeKm = batteryDetails.rangeKm ?? null;
    dto.compatibleNotes = batteryDetails.compatibleNotes ?? null;
    return dto;
  }
}
