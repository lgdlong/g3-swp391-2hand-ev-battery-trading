import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './entities/contract.entity';
import { ContractStatus } from '../../shared/enums/contract-status.enum';
import { ConfirmContractDto } from './dto/confirm-contract.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { Post } from '../posts/entities/post.entity';
import { PostStatus } from '../../shared/enums/post.enum';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Contract)
    private contractRepo: Repository<Contract>,
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
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
    if (contract.status !== ContractStatus.AWAITING_CONFIRMATION && contract.status !== ContractStatus.PENDING_REFUND) {
      throw new BadRequestException(
        `Cannot confirm. Contract status is ${contract.status}`,
      );
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
    if (contract.status !== ContractStatus.AWAITING_CONFIRMATION && contract.status !== ContractStatus.PENDING_REFUND) {
      throw new BadRequestException(
        `Cannot confirm. Contract status is ${contract.status}`,
      );
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
  async forfeitExternal(
    contractId: string,
    userId: number,
  ): Promise<Contract> {
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
    if (contract.status !== ContractStatus.AWAITING_CONFIRMATION && contract.status !== ContractStatus.PENDING_REFUND) {
      throw new BadRequestException(
        `Cannot forfeit. Contract status is ${contract.status}`,
      );
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
}
