import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { Post } from '../posts/entities/post.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '../../shared/enums/order-status.enum';
import { PostStatus } from '../../shared/enums/post.enum';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    private readonly walletsService: WalletsService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Generate unique order code
   */
  private generateOrderCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}${random}`;
  }

  /**
   * Create new order (Buyer mua hàng)
   */
  async create(buyerId: number, dto: CreateOrderDto): Promise<Order> {
    // 1. Tìm bài đăng
    const post = await this.postRepo.findOne({
      where: { id: dto.postId },
      relations: ['seller'],
    });

    if (!post) {
      throw new NotFoundException('Bài đăng không tồn tại');
    }

    // 2. Kiểm tra trạng thái bài đăng
    if (post.status !== PostStatus.PUBLISHED) {
      throw new BadRequestException('Bài đăng không còn khả dụng');
    }

    // 3. Không thể tự mua bài của mình
    if (post.seller.id === buyerId) {
      throw new BadRequestException('Không thể mua bài đăng của chính mình');
    }

    // 4. Kiểm tra đã có order pending chưa
    const existingOrder = await this.orderRepo.findOne({
      where: {
        postId: dto.postId,
        status: OrderStatus.PENDING,
      },
    });

    if (existingOrder) {
      throw new BadRequestException('Đã có đơn hàng đang chờ xử lý cho bài đăng này');
    }

    // 5. Tạo order
    const order = this.orderRepo.create({
      code: this.generateOrderCode(),
      buyerId,
      sellerId: post.seller.id,
      postId: dto.postId,
      amount: post.priceVnd,
      status: OrderStatus.PENDING,
      note: dto.note,
    });

    return this.orderRepo.save(order);
  }

  /**
   * Buyer thanh toán đơn hàng
   */
  async payOrder(orderId: string, buyerId: number): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);

      const order = await orderRepo.findOne({
        where: { id: orderId },
      });

      if (!order) {
        throw new NotFoundException('Đơn hàng không tồn tại');
      }

      if (order.buyerId !== buyerId) {
        throw new ForbiddenException('Bạn không có quyền thanh toán đơn hàng này');
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException('Đơn hàng không ở trạng thái chờ thanh toán');
      }

      // Trừ tiền từ ví buyer (tiền treo)
      await this.walletsService.deduct(
        buyerId,
        order.amount,
        'ORDER_PAYMENT',
        `Thanh toán đơn hàng ${order.code}`,
        'orders',
        order.id,
      );

      // Cập nhật trạng thái
      order.status = OrderStatus.WAITING_SELLER_CONFIRM;

      return orderRepo.save(order);
    });
  }

  /**
   * Seller xác nhận đơn hàng
   */
  async sellerConfirm(orderId: string, sellerId: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    if (order.sellerId !== sellerId) {
      throw new ForbiddenException('Bạn không có quyền xác nhận đơn hàng này');
    }

    if (order.status !== OrderStatus.WAITING_SELLER_CONFIRM) {
      throw new BadRequestException('Đơn hàng không ở trạng thái chờ xác nhận');
    }

    order.status = OrderStatus.PROCESSING;
    order.confirmedAt = new Date();

    return this.orderRepo.save(order);
  }

  /**
   * Buyer xác nhận đã nhận hàng - Hoàn tất giao dịch
   */
  async buyerConfirmReceived(orderId: string, buyerId: number): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);

      const order = await orderRepo.findOne({
        where: { id: orderId },
      });

      if (!order) {
        throw new NotFoundException('Đơn hàng không tồn tại');
      }

      if (order.buyerId !== buyerId) {
        throw new ForbiddenException('Bạn không có quyền xác nhận đơn hàng này');
      }

      if (order.status !== OrderStatus.PROCESSING) {
        throw new BadRequestException('Đơn hàng không ở trạng thái đang giao');
      }

      // Tính phí hoa hồng (VD: 5%)
      const commissionRate = 0.05;
      const amount = Number.parseFloat(order.amount);
      const commissionFee = Math.round(amount * commissionRate);
      const sellerReceiveAmount = amount - commissionFee;

      // Chuyển tiền vào ví seller
      await this.walletsService.topUp(
        order.sellerId,
        sellerReceiveAmount.toString(),
        `Nhận tiền đơn hàng ${order.code}`,
        order.id,
      );

      // Cập nhật order
      order.status = OrderStatus.COMPLETED;
      order.completedAt = new Date();
      order.commissionFee = commissionFee.toString();
      order.sellerReceiveAmount = sellerReceiveAmount.toString();

      // Cập nhật post thành SOLD
      await manager.getRepository(Post).update(order.postId, { status: PostStatus.SOLD });

      return orderRepo.save(order);
    });
  }

  /**
   * Hủy đơn hàng
   */
  async cancelOrder(orderId: string, userId: number, note?: string): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);

      const order = await orderRepo.findOne({
        where: { id: orderId },
      });

      if (!order) {
        throw new NotFoundException('Đơn hàng không tồn tại');
      }

      // Chỉ buyer hoặc seller mới có quyền hủy
      if (order.buyerId !== userId && order.sellerId !== userId) {
        throw new ForbiddenException('Bạn không có quyền hủy đơn hàng này');
      }

      // Chỉ hủy được khi PENDING hoặc WAITING_SELLER_CONFIRM
      if (![OrderStatus.PENDING, OrderStatus.WAITING_SELLER_CONFIRM].includes(order.status)) {
        throw new BadRequestException('Không thể hủy đơn hàng ở trạng thái này');
      }

      // Hoàn tiền nếu đã thanh toán
      if (order.status === OrderStatus.WAITING_SELLER_CONFIRM) {
        await this.walletsService.topUp(
          order.buyerId,
          order.amount,
          `Hoàn tiền đơn hàng ${order.code} bị hủy`,
          order.id,
        );
      }

      order.status = OrderStatus.CANCELLED;
      order.cancelledAt = new Date();
      if (note) {
        order.note = order.note ? `${order.note} | Hủy: ${note}` : `Hủy: ${note}`;
      }

      return orderRepo.save(order);
    });
  }

  /**
   * Tạo tranh chấp
   */
  async createDispute(orderId: string, userId: number, note: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new ForbiddenException('Bạn không có quyền tạo tranh chấp');
    }

    if (order.status !== OrderStatus.PROCESSING) {
      throw new BadRequestException('Chỉ có thể tạo tranh chấp khi đơn hàng đang giao');
    }

    order.status = OrderStatus.DISPUTE;
    order.note = order.note ? `${order.note} | Tranh chấp: ${note}` : `Tranh chấp: ${note}`;

    return this.orderRepo.save(order);
  }

  /**
   * Lấy đơn hàng theo ID
   */
  async findOne(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['buyer', 'seller', 'post'],
    });

    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    return order;
  }

  /**
   * Lấy đơn hàng theo code
   */
  async findByCode(code: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { code },
      relations: ['buyer', 'seller', 'post'],
    });

    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    return order;
  }

  /**
   * Lấy danh sách đơn hàng của user (buyer hoặc seller)
   */
  async findByUser(
    userId: number,
    role: 'buyer' | 'seller' | 'all' = 'all',
    status?: OrderStatus,
  ): Promise<Order[]> {
    const queryBuilder = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('order.seller', 'seller')
      .leftJoinAndSelect('order.post', 'post');

    if (role === 'buyer') {
      queryBuilder.where('order.buyerId = :userId', { userId });
    } else if (role === 'seller') {
      queryBuilder.where('order.sellerId = :userId', { userId });
    } else {
      queryBuilder.where('(order.buyerId = :userId OR order.sellerId = :userId)', { userId });
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    queryBuilder.orderBy('order.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  /**
   * Lấy tất cả đơn hàng (Admin)
   */
  async findAll(status?: OrderStatus): Promise<Order[]> {
    const queryBuilder = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('order.seller', 'seller')
      .leftJoinAndSelect('order.post', 'post');

    if (status) {
      queryBuilder.where('order.status = :status', { status });
    }

    queryBuilder.orderBy('order.createdAt', 'DESC');

    return queryBuilder.getMany();
  }
}
