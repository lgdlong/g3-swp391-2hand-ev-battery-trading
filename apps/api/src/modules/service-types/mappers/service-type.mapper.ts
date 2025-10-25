import { ServiceType } from '../entities/service-type.entity';
import { ServiceTypeResponseDto } from '../dto/service-type-response.dto';

export class ServiceTypeMapper {
  static toResponseDto(serviceType: ServiceType): ServiceTypeResponseDto {
    return {
      id: serviceType.id,
      code: serviceType.code,
      name: serviceType.name,
      description: serviceType.description,
      isActive: serviceType.isActive,
      createdAt: serviceType.createdAt,
    };
  }

  static toResponseDtoArray(serviceTypes: ServiceType[]): ServiceTypeResponseDto[] {
    return serviceTypes.map((serviceType) => this.toResponseDto(serviceType));
  }
}
