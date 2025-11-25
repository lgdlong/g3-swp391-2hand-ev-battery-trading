import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Order } from './entities/order.entity';
import { Post } from '../posts/entities/post.entity';
import { BuyNowDto, SellerConfirmDto, SellerAction } from './dto';
import { OrderStatus } from '../../shared/enums/order-status.enum';
import { PostStatus } from '../../shared/enums/post.enum';
import { WalletsService } from '../wallets/wallets.service';

// Admin ID nhận hoa hồng
const ADMIN_COMMISSION_ACCOUNT_ID = 1;

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
   * API 1: Mua ngay (Buy Now) - Escrow Flow
   * 1. Check post status = PUBLISHED
   * 2. Check buyer balance
   * 3. Deduct with BUY_HOLD
   * 4. Create order with WAITING_SELLER_CONFIRM
   * 5. Lock post to LOCKED
   */
  async buyNow(buyerId: number, dto: BuyNowDto): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const postRepo = manager.getRepository(Post);

      // 1. Tìm bài đăng
      const post = await postRepo.findOne({
        where: { id: dto.postId },
        relations: ['seller'],
      });

      if (!post) {
        throw new NotFoundException('Bài đăng không tồn tại');
      }

      // 2. Kiểm tra trạng thái bài đăng - chỉ cho phép PUBLISHED
      if (post.status !== PostStatus.PUBLISHED) {
        throw new BadRequestException('Xe đang giao dịch hoặc không còn khả dụng');
      }

      // 3. Không thể tự mua bài của mình
      if (post.seller.id === buyerId) {
        throw new BadRequestException('Không thể mua bài đăng của chính mình');
      }

      // 4. Kiểm tra đã có order đang xử lý chưa
      const existingOrder = await orderRepo.findOne({
        where: {
          postId: dto.postId,
          status: In([OrderStatus.WAITING_SELLER_CONFIRM, OrderStatus.PROCESSING]),
        },
      });

      if (existingOrder) {
        throw new BadRequestException('Đã có đơn hàng đang xử lý cho bài đăng này');
      }

      // 5. Lấy giá từ bài đăng
      const amount = post.priceVnd;

      // 6. Trừ tiền từ ví buyer (tiền treo - BUY_HOLD)
      await this.walletsService.deduct(
        buyerId,
        amount,
        'BUY_HOLD',
        `Giữ tiền mua hàng - Bài đăng ${post.id}`,
        'orders',
        dto.postId,
      );

      // 7. Tạo order với trạng thái WAITING_SELLER_CONFIRM
      const order = orderRepo.create({
        code: this.generateOrderCode(),
        buyerId,
        sellerId: post.seller.id,
        postId: dto.postId,
        amount,
        status: OrderStatus.WAITING_SELLER_CONFIRM,
        note: dto.note,
      });

      const savedOrder = await orderRepo.save(order);

      // 8. Khóa bài đăng (LOCKED)
      await postRepo.update(dto.postId, { status: PostStatus.LOCKED });

      return savedOrder;
    });
  }

  /**
   * API 2: Seller xác nhận đơn hàng (ACCEPT / REJECT)
   * ACCEPT: status -> PROCESSING
   * REJECT: Hoàn tiền buyer, status -> CANCELLED, unlock post -> PUBLISHED
   */
  async sellerConfirm(orderId: string, sellerId: number, dto: SellerConfirmDto): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const postRepo = manager.getRepository(Post);

      const order = await orderRepo.findOne({
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

      if (dto.action === SellerAction.ACCEPT) {
        // ACCEPT: Chuyển sang PROCESSING
        order.status = OrderStatus.PROCESSING;
        order.confirmedAt = new Date();
        if (dto.note) {
          order.note = order.note ? `${order.note} | Seller: ${dto.note}` : `Seller: ${dto.note}`;
        }
      } else {
        // REJECT: Hoàn tiền buyer, hủy đơn, mở lại bài đăng
        await this.walletsService.topUp(
          order.buyerId,
          order.amount,
          `Hoàn tiền - Seller từ chối đơn ${order.code}`,
          order.id,
        );

        order.status = OrderStatus.CANCELLED;
        order.cancelledAt = new Date();
        order.note = order.note
          ? `${order.note} | Seller từ chối: ${dto.note || 'Không có lý do'}`
          : `Seller từ chối: ${dto.note || 'Không có lý do'}`;

        // Mở lại bài đăng
        await postRepo.update(order.postId, { status: PostStatus.PUBLISHED });
      }

      return orderRepo.save(order);
    });
  }

  /**
   * API 3: Hoàn tất đơn hàng (Buyer xác nhận nhận hàng)
   * - Tính commission 2%
   * - Chuyển tiền cho seller (amount - commission)
   * - Chuyển commission cho Admin
   * - Status -> COMPLETED
   * - Post -> SOLD
   */
  async completeOrder(orderId: string, buyerId: number): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const postRepo = manager.getRepository(Post);

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

      // Tính phí hoa hồng 2%
      const commissionRate = 0.02;
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

      // Chuyển hoa hồng cho Admin
      if (commissionFee > 0) {
        await this.walletsService.topUp(
          ADMIN_COMMISSION_ACCOUNT_ID,
          commissionFee.toString(),
          `Hoa hồng đơn hàng ${order.code}`,
          order.id,
        );
      }

      // Cập nhật order
      order.status = OrderStatus.COMPLETED;
      order.completedAt = new Date();
      order.commissionFee = commissionFee.toString();
      order.sellerReceiveAmount = sellerReceiveAmount.toString();

      // Cập nhật post thành SOLD
      await postRepo.update(order.postId, { status: PostStatus.SOLD });

      return orderRepo.save(order);
    });
  }

  /**
   * Hủy đơn hàng (Buyer hủy)
   */
  async cancelOrder(orderId: string, userId: number, note?: string): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const postRepo = manager.getRepository(Post);

      const order = await orderRepo.findOne({
        where: { id: orderId },
      });

      if (!order) {
        throw new NotFoundException('Đơn hàng không tồn tại');
      }

      // Chỉ buyer mới có quyền hủy
      if (order.buyerId !== userId) {
        throw new ForbiddenException('Bạn không có quyền hủy đơn hàng này');
      }

      // Chỉ hủy được khi WAITING_SELLER_CONFIRM
      if (order.status !== OrderStatus.WAITING_SELLER_CONFIRM) {
        throw new BadRequestException('Không thể hủy đơn hàng ở trạng thái này');
      }

      // Hoàn tiền cho buyer
      await this.walletsService.topUp(
        order.buyerId,
        order.amount,
        `Hoàn tiền - Buyer hủy đơn ${order.code}`,
        order.id,
      );

      order.status = OrderStatus.CANCELLED;
      order.cancelledAt = new Date();
      if (note) {
        order.note = order.note ? `${order.note} | Buyer hủy: ${note}` : `Buyer hủy: ${note}`;
      }

      // Mở lại bài đăng
      await postRepo.update(order.postId, { status: PostStatus.PUBLISHED });

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
