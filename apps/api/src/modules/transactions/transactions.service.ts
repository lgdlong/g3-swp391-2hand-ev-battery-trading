import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Contract } from './entities/contract.entity';
import { ContractStatus } from '../../shared/enums/contract-status.enum';
import { ConfirmContractDto } from './dto/confirm-contract.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { Post } from '../posts/entities/post.entity';
import { PostStatus } from '../../shared/enums/post.enum';
import { PostPayment } from './entities/post-payment.entity';
import { CreatePostPaymentDto } from './dto/create-post-payment.dto';
import { PostPaymentResponseDto } from './dto/post-payment-response.dto';
import { WalletsService } from '../wallets/wallets.service';
import { FeeTierService } from '../settings/service/fee-tier.service';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Contract)
    private contractRepo: Repository<Contract>,
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
    @InjectRepository(PostPayment)
    private readonly postPaymentRepository: Repository<PostPayment>,
    private readonly walletsService: WalletsService,
    private readonly feeTierService: FeeTierService,
    private readonly entityManager: EntityManager,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  /**
   * Create a new contract for a post
   */
  async createContract(listingId: string, buyerId: number): Promise<Contract> {
    // Check if post exists and is published
    const post = await this.postRepo.findOne({
      where: { id: listingId },
      relations: ['seller'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${listingId} not found`);
    }

    if (post.status !== PostStatus.PUBLISHED) {
      throw new BadRequestException('Post is not published and cannot be purchased');
    }

    const sellerId = typeof post.seller === 'object' ? post.seller.id : post.seller;

    // Check if buyer is not the seller
    if (sellerId === buyerId) {
      throw new BadRequestException('You cannot purchase your own post');
    }

    // Check if contract already exists for this listing and buyer
    const existingContract = await this.contractRepo.findOne({
      where: {
        listingId,
        buyerId,
        status: ContractStatus.AWAITING_CONFIRMATION,
      },
    });

    if (existingContract) {
      throw new BadRequestException('A contract already exists for this listing');
    }

    // Create contract with post snapshot
    const contract = this.contractRepo.create({
      listingId,
      buyerId,
      sellerId,
      listingSnapshot: {
        id: post.id,
        title: post.title,
        priceVnd: post.priceVnd,
        postType: post.postType,
        description: post.description,
        createdAt: post.createdAt,
      },
      status: ContractStatus.AWAITING_CONFIRMATION,
      isExternalTransaction: false,
    });

    const savedContract = await this.contractRepo.save(contract);

    // Reload with relations
    return this.contractRepo.findOne({
      where: { id: savedContract.id },
      relations: ['buyer', 'seller'],
    }) as Promise<Contract>;
  }

  /**
   * Create contract by seller (for seller to confirm order)
   * Seller can create contract with specific buyerId
   */
  async createContractBySeller(
    listingId: string,
    sellerId: number,
    buyerId: number,
  ): Promise<Contract> {
    // Check if post exists and seller is the owner
    const post = await this.postRepo.findOne({
      where: { id: listingId },
      relations: ['seller'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${listingId} not found`);
    }

    const postSellerId = typeof post.seller === 'object' ? post.seller.id : post.seller;

    // Check if user is the seller
    if (postSellerId !== sellerId) {
      throw new ForbiddenException('Only the seller can create contract for this post');
    }

    if (post.status !== PostStatus.PUBLISHED) {
      throw new BadRequestException('Post is not published and cannot be purchased');
    }

    // Check if buyer is not the seller
    if (postSellerId === buyerId) {
      throw new BadRequestException('Buyer cannot be the seller');
    }

    // Check if contract already exists for this listing and buyer
    const existingContract = await this.contractRepo.findOne({
      where: {
        listingId,
        buyerId,
        status: ContractStatus.AWAITING_CONFIRMATION,
      },
    });

    if (existingContract) {
      throw new BadRequestException('A contract already exists for this listing and buyer');
    }

    // Create contract with post snapshot
    // When seller confirms order, set sellerConfirmedAt and wait for buyer to confirm receipt
    const contract = this.contractRepo.create({
      listingId,
      buyerId,
      sellerId: postSellerId,
      listingSnapshot: {
        id: post.id,
        title: post.title,
        priceVnd: post.priceVnd,
        postType: post.postType,
        description: post.description,
        createdAt: post.createdAt,
      },
      status: ContractStatus.AWAITING_CONFIRMATION, // Wait for buyer to confirm receipt
      isExternalTransaction: false,
      sellerConfirmedAt: new Date(), // Seller confirms when creating contract
    });

    const savedContract = await this.contractRepo.save(contract);

    // Reload with relations
    return this.contractRepo.findOne({
      where: { id: savedContract.id },
      relations: ['buyer', 'seller'],
    }) as Promise<Contract>;
  }

  /**
   * Get contract by buyer and listing ID (for buyer to see their contract)
   */
  async getContractByBuyerAndListing(listingId: string, buyerId: number): Promise<Contract | null> {
    // Check if post exists
    const post = await this.postRepo.findOne({
      where: { id: listingId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${listingId} not found`);
    }

    // Get contract for this buyer and listing
    const contract = await this.contractRepo.findOne({
      where: {
        listingId,
        buyerId,
      },
      relations: ['buyer', 'seller'],
      order: { createdAt: 'DESC' },
    });

    return contract;
  }

  /**
   * Get contract by listing ID and buyer ID (for seller to see contract with specific buyer)
   */
  async getContractByListingAndBuyer(
    listingId: string,
    buyerId: number,
    userId: number,
  ): Promise<Contract | null> {
    // Check if post exists
    const post = await this.postRepo.findOne({
      where: { id: listingId },
      relations: ['seller'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${listingId} not found`);
    }

    const sellerId = typeof post.seller === 'object' ? post.seller.id : post.seller;

    // Check if user is the seller
    if (sellerId !== userId) {
      throw new ForbiddenException('Only the seller can view contracts for this post');
    }

    // Get contract for this listing and buyer
    const contract = await this.contractRepo.findOne({
      where: {
        listingId,
        buyerId,
      },
      relations: ['buyer', 'seller'],
    });

    return contract;
  }

  /**
   * Get contracts by listing ID (for seller to see all contracts)
   */
  async getContractsByListingId(listingId: string, userId: number): Promise<Contract[]> {
    // Check if post exists and user is the seller
    const post = await this.postRepo.findOne({
      where: { id: listingId },
      relations: ['seller'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${listingId} not found`);
    }

    const sellerId = typeof post.seller === 'object' ? post.seller.id : post.seller;

    // Check if user is the seller
    if (sellerId !== userId) {
      throw new ForbiddenException('Only the seller can view contracts for this post');
    }

    // Get all contracts for this listing
    const contracts = await this.contractRepo.find({
      where: { listingId },
      relations: ['buyer', 'seller'],
      order: { createdAt: 'DESC' },
    });

    return contracts;
  }

  /**
   * Get all contracts for a seller
   */
  async getSellerContracts(sellerId: number): Promise<Contract[]> {
    const contracts = await this.contractRepo.find({
      where: { sellerId },
      relations: ['buyer', 'seller'],
      order: { createdAt: 'DESC' },
    });

    return contracts;
  }

  /**
   * Get all contracts for a buyer
   */
  async getBuyerContracts(buyerId: number): Promise<Contract[]> {
    const contracts = await this.contractRepo.find({
      where: { buyerId },
      relations: ['buyer', 'seller'],
      order: { createdAt: 'DESC' },
    });

    return contracts;
  }

  /**
   * Get contract by ID with authorization check
   */
  async getContract(contractId: string, userId: number): Promise<Contract> {
    const contract = await this.contractRepo.findOne({
      where: { id: contractId },
      relations: ['buyer', 'seller'],
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${contractId} not found`);
    }

    // Check if user is buyer or seller
    if (contract.buyerId !== userId && contract.sellerId !== userId) {
      throw new ForbiddenException('You are not authorized to view this contract');
    }

    return contract;
  }

  /**
   * Buyer confirms receipt of the item
   */
  async confirmByBuyer(
    contractId: string,
    userId: number,
    dto: ConfirmContractDto,
  ): Promise<Contract> {
    const contract = await this.contractRepo.findOne({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${contractId} not found`);
    }

    // Check if user is the buyer
    if (contract.buyerId !== userId) {
      throw new ForbiddenException('Only the buyer can confirm receipt');
    }

    // Check if contract is in a valid state
    if (
      contract.status !== ContractStatus.AWAITING_CONFIRMATION &&
      contract.status !== ContractStatus.PENDING_REFUND
    ) {
      throw new BadRequestException(`Cannot confirm. Contract status is ${contract.status}`);
    }

    // Check if buyer already confirmed
    if (contract.buyerConfirmedAt) {
      throw new BadRequestException('Buyer has already confirmed');
    }

    // Update buyer confirmation
    contract.buyerConfirmedAt = new Date();
    await this.contractRepo.save(contract);

    // Check if both parties confirmed
    await this.checkAndUpdateStatus(contract);

    // Reload contract to get updated status
    return this.contractRepo.findOne({
      where: { id: contractId },
      relations: ['buyer', 'seller'],
    }) as Promise<Contract>;
  }

  /**
   * Seller confirms delivery
   */
  async confirmBySeller(
    contractId: string,
    userId: number,
    dto: ConfirmContractDto,
  ): Promise<Contract> {
    const contract = await this.contractRepo.findOne({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${contractId} not found`);
    }

    // Check if user is the seller
    if (contract.sellerId !== userId) {
      throw new ForbiddenException('Only the seller can confirm delivery');
    }

    // Check if contract is in a valid state
    if (
      contract.status !== ContractStatus.AWAITING_CONFIRMATION &&
      contract.status !== ContractStatus.PENDING_REFUND
    ) {
      throw new BadRequestException(`Cannot confirm. Contract status is ${contract.status}`);
    }

    // Check if seller already confirmed
    if (contract.sellerConfirmedAt) {
      throw new BadRequestException('Seller has already confirmed');
    }

    // Update seller confirmation
    contract.sellerConfirmedAt = new Date();
    await this.contractRepo.save(contract);

    // Check if both parties confirmed
    await this.checkAndUpdateStatus(contract);

    // Reload contract to get updated status
    return this.contractRepo.findOne({
      where: { id: contractId },
      relations: ['buyer', 'seller'],
    }) as Promise<Contract>;
  }

  /**
   * Seller reports sold outside the system
   */
  async forfeitExternal(contractId: string, userId: number): Promise<Contract> {
    const contract = await this.contractRepo.findOne({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${contractId} not found`);
    }

    // Check if user is the seller
    if (contract.sellerId !== userId) {
      throw new ForbiddenException('Only the seller can report external sale');
    }

    // Check if contract is in a valid state
    if (
      contract.status !== ContractStatus.AWAITING_CONFIRMATION &&
      contract.status !== ContractStatus.PENDING_REFUND
    ) {
      throw new BadRequestException(`Cannot forfeit. Contract status is ${contract.status}`);
    }

    // Update contract status to FORFEITED_EXTERNAL and mark as external transaction
    contract.status = ContractStatus.FORFEITED_EXTERNAL;
    contract.isExternalTransaction = true;
    contract.sellerConfirmedAt = new Date(); // Mark seller action time
    await this.contractRepo.save(contract);

    // Reload contract
    return this.contractRepo.findOne({
      where: { id: contractId },
      relations: ['buyer', 'seller'],
    }) as Promise<Contract>;
  }

  /**
   * Check if both parties confirmed and update status to SUCCESS
   * This method is called after buyer or seller confirmation
   */
  private async checkAndUpdateStatus(contract: Contract): Promise<void> {
    // Reload contract to get latest state
    const updatedContract = await this.contractRepo.findOne({
      where: { id: contract.id },
    });

    if (!updatedContract) {
      return;
    }

    // Check if both parties confirmed
    if (updatedContract.buyerConfirmedAt && updatedContract.sellerConfirmedAt) {
      // Both confirmed - update status to SUCCESS
      updatedContract.status = ContractStatus.SUCCESS;
      updatedContract.confirmedAt = new Date(); // Time when both confirmed
      await this.contractRepo.save(updatedContract);

      // TODO: Trigger fee collection flow here
      // This is where you would call the fee collection service
      // For now, we just update the status
    } else {
      // Only one party confirmed - keep status as AWAITING_CONFIRMATION or PENDING_REFUND
      // Status remains unchanged, waiting for the other party
    }
  }

  /**
   * Create a new post payment record
   */
  async createPostPayment(
    createPostPaymentDto: CreatePostPaymentDto,
  ): Promise<PostPaymentResponseDto> {
    const postPayment = this.postPaymentRepository.create(createPostPaymentDto);
    const savedPayment = await this.postPaymentRepository.save(postPayment);
    return this.mapToResponseDto(savedPayment);
  }

  /**
   * Process post payment with wallet deduction and create payment record
   * This method ensures both wallet deduction and post payment creation happen together
   * @param userId - User ID
   * @param postId - Post ID
   * @param priceVnd - Post price in VND for fee calculation
   * @returns Combined wallet transaction and post payment information
   */
  async processPostPayment(
    userId: number,
    postId: string,
    priceVnd: number,
  ): Promise<{ wallet: any; transaction: any; postPayment: PostPaymentResponseDto }> {
    // Check if post has already been paid for
    const existingPayment = await this.isPostPaid(postId);
    if (existingPayment) {
      throw new BadRequestException('Bài đăng này đã được thanh toán rồi');
    }

    // Find applicable fee tier
    const feeTiers = await this.feeTierService.findAll();
    const applicableTier = feeTiers.find((tier) => {
      const minPrice = tier.minPrice;
      const maxPrice = tier.maxPrice;
      return priceVnd >= minPrice && (maxPrice === null || priceVnd <= maxPrice);
    });

    if (!applicableTier) {
      throw new BadRequestException('Không tìm thấy bậc phí phù hợp với giá bài đăng');
    }

    // Calculate deposit amount
    const depositRate = applicableTier.depositRate;
    const depositAmount = Math.round(priceVnd * depositRate);

    // Execute wallet deduction and post payment creation in sequence
    // Note: WalletsService.deduct already uses a transaction internally
    const walletResult = await this.walletsService.deduct(
      userId,
      depositAmount.toString(),
      'POST_PAYMENT',
      `Phí đặt cọc đăng bài #${postId}`,
      'posts',
      postId,
    );

    // Create post payment record linked to the wallet transaction
    const postPayment = await this.createPostPayment({
      postId,
      accountId: userId,
      amountPaid: depositAmount.toString(),
      walletTransactionId: walletResult.transaction.id,
    });

    return {
      wallet: walletResult.wallet,
      transaction: walletResult.transaction,
      postPayment,
    };
  }

  /**
   * Get post payment by post ID
   */
  async getPostPaymentByPostId(postId: string): Promise<PostPaymentResponseDto> {
    const postPayment = await this.postPaymentRepository.findOne({
      where: { postId },
      relations: ['account', 'walletTransaction'],
    });

    if (!postPayment) {
      throw new NotFoundException(`Post payment not found for post ID: ${postId}`);
    }

    return this.mapToResponseDto(postPayment);
  }

  /**
   * Get all post payments by account ID
   */
  async getPostPaymentsByAccountId(accountId: number): Promise<PostPaymentResponseDto[]> {
    const postPayments = await this.postPaymentRepository.find({
      where: { accountId },
      relations: ['account', 'walletTransaction'],
      order: { createdAt: 'DESC' },
    });

    return postPayments.map((payment) => this.mapToResponseDto(payment));
  }

  /**
   * Get all post payments with pagination
   */
  async getAllPostPayments(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: PostPaymentResponseDto[]; total: number; page: number; limit: number }> {
    const [postPayments, total] = await this.postPaymentRepository.findAndCount({
      relations: ['account', 'walletTransaction'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: postPayments.map((payment) => this.mapToResponseDto(payment)),
      total,
      page,
      limit,
    };
  }

  /**
   * Check if post has been paid for
   */
  async isPostPaid(postId: string): Promise<boolean> {
    const postPayment = await this.postPaymentRepository.findOne({
      where: { postId },
    });

    return !!postPayment;
  }

  /**
   * Delete post payment (should be used with caution)
   */
  async deletePostPayment(postId: string): Promise<void> {
    const result = await this.postPaymentRepository.delete({ postId });

    if (result.affected === 0) {
      throw new NotFoundException(`Post payment not found for post ID: ${postId}`);
    }
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(postPayment: PostPayment): PostPaymentResponseDto {
    return {
      postId: postPayment.postId,
      accountId: postPayment.accountId,
      amountPaid: postPayment.amountPaid,
      walletTransactionId: postPayment.walletTransactionId,
      createdAt: postPayment.createdAt,
    };
  }

  /**
   * Record post deposit payment when user pays VND to create post
   * @param postId - Post ID
   * @param accountId - User account ID who paid deposit
   * @param amountPaid - Deposit amount paid
   * @param walletTransactionId - Related wallet transaction ID
   * @returns Created post payment record
   */
  async recordPostDepositPayment(
    postId: string,
    accountId: number,
    amountPaid: string,
    walletTransactionId: number,
  ): Promise<PostPayment> {
    // Check if payment already exists for this post
    const existingPayment = await this.postPaymentRepository.findOne({
      where: { postId },
    });

    if (existingPayment) {
      throw new ConflictException(`Post ${postId} already has a deposit payment record`);
    }

    // Create new payment record
    const postPayment = this.postPaymentRepository.create({
      postId,
      accountId,
      amountPaid,
      walletTransactionId,
    });

    return await this.postPaymentRepository.save(postPayment);
  }

  /**
   * Get post deposit payment by post ID
   * @param postId - Post ID
   * @returns Post payment record or null
   */
  async getPostDepositPayment(postId: string): Promise<PostPayment | null> {
    return await this.postPaymentRepository.findOne({
      where: { postId },
      relations: ['account', 'walletTransaction'],
    });
  }

  /**
   * Check if post has deposit payment
   * @param postId - Post ID
   * @returns True if deposit paid, false otherwise
   */
  async hasDepositPayment(postId: string): Promise<boolean> {
    const payment = await this.postPaymentRepository.findOne({
      where: { postId },
    });
    return !!payment;
  }

  /**
   * Initiate contract confirmation (Seller starts the flow)
   * Creates a contract and sends WebSocket signal to buyer
   */
  async initiateConfirmation(
    dto: { listingId: string; conversationId: number },
    sellerId: number,
  ): Promise<Contract> {
    // 1. Get post info
    const post = await this.postRepo.findOne({
      where: { id: dto.listingId },
      relations: ['seller'],
    });

    if (!post) {
      throw new NotFoundException('Bài đăng không tồn tại.');
    }

    const postSellerId = typeof post.seller === 'object' ? post.seller.id : post.seller;

    if (postSellerId !== sellerId) {
      throw new ForbiddenException('Bạn không phải chủ bài đăng này.');
    }

    if (post.status === PostStatus.SOLD) {
      throw new BadRequestException('Bài đăng này đã được bán.');
    }

    // 2. Get buyer info from conversation
    const conversation = await this.chatService.getConversationById(dto.conversationId, sellerId);

    if (!conversation) {
      throw new NotFoundException('Không tìm thấy cuộc trò chuyện.');
    }

    const buyerId =
      conversation.buyerId === sellerId ? conversation.sellerId : conversation.buyerId;

    // 3. Check for existing pending contract
    const existingContract = await this.contractRepo.findOne({
      where: {
        listingId: dto.listingId,
        buyerId: buyerId,
        status: ContractStatus.AWAITING_CONFIRMATION,
      },
    });

    if (existingContract && existingContract.sellerConfirmedAt) {
      throw new BadRequestException('Đã có yêu cầu xác nhận đang chờ xử lý.');
    }

    // 4. Create or update contract
    let contract: Contract;
    if (existingContract) {
      existingContract.sellerConfirmedAt = new Date();
      contract = await this.contractRepo.save(existingContract);
    } else {
      const newContract = this.contractRepo.create({
        listingId: dto.listingId,
        sellerId: sellerId,
        buyerId: buyerId,
        status: ContractStatus.AWAITING_CONFIRMATION,
        sellerConfirmedAt: new Date(),
        buyerConfirmedAt: null,
        listingSnapshot: {
          id: post.id,
          title: post.title,
          priceVnd: post.priceVnd,
          postType: post.postType,
          description: post.description,
          createdAt: post.createdAt,
        },
      });
      contract = await this.contractRepo.save(newContract);
    }

    // 5. Send WebSocket signal to buyer
    this.chatGateway.sendConfirmationCard(dto.conversationId, contract.id);

    return contract;
  }

  /**
   * Buyer agrees to contract (completes the transaction)
   * Updates contract status and generates PDF
   */
  async agreeToContract(contractId: string, buyerId: number): Promise<Contract> {
    return this.entityManager.transaction(async (manager) => {
      const contractRepo = manager.getRepository(Contract);

      // 1. Lock contract row FIRST (without LEFT JOIN)
      const contractLocked = await contractRepo.findOne({
        where: { id: contractId },
        lock: { mode: 'pessimistic_write' },
      });

      // 2. Validations
      if (!contractLocked) {
        throw new NotFoundException('Không tìm thấy hợp đồng.');
      }

      if (contractLocked.buyerId !== buyerId) {
        throw new ForbiddenException('Bạn không phải người mua.');
      }

      if (contractLocked.status !== ContractStatus.AWAITING_CONFIRMATION) {
        throw new BadRequestException('Hợp đồng đã được xử lý.');
      }

      if (contractLocked.buyerConfirmedAt) {
        throw new BadRequestException('Bạn đã xác nhận rồi.');
      }

      if (!contractLocked.sellerConfirmedAt) {
        throw new BadRequestException('Người bán chưa xác nhận.');
      }

      // 3. Load relations AFTER locking (separate query, no lock needed)
      const contract = await contractRepo.findOne({
        where: { id: contractId },
        relations: ['seller', 'buyer'],
      });

      if (!contract) {
        throw new NotFoundException('Không thể tải thông tin hợp đồng.');
      }

      // 4. Generate PDF (placeholder - implement actual PDF generation later)
      const pdfUrl = `/contracts/contract-${contract.id}.pdf`;

      // 5. Update contract
      contract.buyerConfirmedAt = new Date();
      contract.confirmedAt = new Date();
      contract.status = ContractStatus.SUCCESS;
      contract.filePath = pdfUrl;
      await contractRepo.save(contract);

      // 6. Update post status to SOLD
      const postRepo = manager.getRepository(Post);
      await postRepo.update(contract.listingId, { status: PostStatus.SOLD });

      // 7. Find conversation and send WebSocket signal
      const conversations = await this.chatService.getUserConversations(buyerId);
      const conversation = conversations.find(
        (conv) =>
          conv.postId === contract.listingId &&
          ((conv.buyerId === buyerId && conv.sellerId === contract.sellerId) ||
            (conv.sellerId === buyerId && conv.buyerId === contract.sellerId)),
      );

      if (conversation) {
        this.chatGateway.sendConfirmationComplete(
          Number.parseInt(conversation.id),
          contract.id,
          pdfUrl,
        );
      }

      return contract;
    });
  }
}
