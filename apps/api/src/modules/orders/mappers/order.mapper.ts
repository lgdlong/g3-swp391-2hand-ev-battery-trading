import { Order } from '../entities/order.entity';
import { OrderResponseDto, OrderWithRelationsDto } from '../dto';

export class OrderMapper {
  /**
   * Chuyển đổi Order entity sang OrderResponseDto
   */
  static toResponseDto(order: Order): OrderResponseDto {
    const dto = new OrderResponseDto();
    dto.id = order.id;
    dto.code = order.code;
    dto.buyerId = order.buyerId;
    dto.sellerId = order.sellerId;
    dto.postId = order.postId;
    dto.amount = order.amount;
    dto.commissionFee = order.commissionFee || '0';
    dto.sellerReceiveAmount = order.sellerReceiveAmount || '0';
    dto.status = order.status;
    dto.createdAt = order.createdAt;
    dto.confirmedAt = order.confirmedAt;
    dto.completedAt = order.completedAt;
    dto.cancelledAt = order.cancelledAt;
    dto.note = order.note;
    return dto;
  }

  /**
   * Chuyển đổi Order entity (có relations) sang OrderWithRelationsDto
   */
  static toWithRelationsDto(order: Order): OrderWithRelationsDto {
    const dto = new OrderWithRelationsDto();
    dto.id = order.id;
    dto.code = order.code;
    dto.buyerId = order.buyerId;
    dto.sellerId = order.sellerId;
    dto.postId = order.postId;
    dto.amount = order.amount;
    dto.commissionFee = order.commissionFee || '0';
    dto.sellerReceiveAmount = order.sellerReceiveAmount || '0';
    dto.status = order.status;
    dto.createdAt = order.createdAt;
    dto.confirmedAt = order.confirmedAt;
    dto.completedAt = order.completedAt;
    dto.cancelledAt = order.cancelledAt;
    dto.note = order.note;

    // Thêm thông tin relations
    if (order.buyer) {
      dto.buyer = {
        id: order.buyer.id,
        fullName: order.buyer.fullName,
        email: order.buyer.email,
        phone: order.buyer.phone,
        avatarUrl: order.buyer.avatarUrl,
      };
    }

    if (order.seller) {
      dto.seller = {
        id: order.seller.id,
        fullName: order.seller.fullName,
        email: order.seller.email,
        phone: order.seller.phone,
        avatarUrl: order.seller.avatarUrl,
      };
    }

    if (order.post) {
      dto.post = {
        id: order.post.id,
        title: order.post.title,
        priceVnd: order.post.priceVnd,
        postType: order.post.postType,
        images: order.post.images
          ? order.post.images
              .sort((a, b) => a.position - b.position)
              .map((img) => ({
                id: img.id,
                url: img.url,
                position: img.position,
              }))
          : [],
      };
    }

    return dto;
  }

  /**
   * Chuyển đổi mảng Order entities sang mảng DTOs
   */
  static toWithRelationsDtos(orders: Order[]): OrderWithRelationsDto[] {
    return orders.map((order) => this.toWithRelationsDto(order));
  }
}
