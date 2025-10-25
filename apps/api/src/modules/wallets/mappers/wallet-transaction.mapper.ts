import { WalletTransaction } from '../entities/wallet-transaction.entity';
import { WalletTransactionResponseDto } from '../dto/wallet-transaction-response.dto';
import { ServiceTypeResponseDto } from '../../service-types/dto/service-type-response.dto';

export class WalletTransactionMapper {
  static toResponseDto(walletTransaction: WalletTransaction): WalletTransactionResponseDto {
    return {
      id: walletTransaction.id,
      walletUserId: walletTransaction.walletUserId,
      amount: walletTransaction.amount,
      serviceTypeId: walletTransaction.serviceTypeId,
      serviceType: walletTransaction.serviceType
        ? {
            id: walletTransaction.serviceType.id,
            code: walletTransaction.serviceType.code,
            name: walletTransaction.serviceType.name,
            description: walletTransaction.serviceType.description,
            isActive: walletTransaction.serviceType.isActive,
            createdAt: walletTransaction.serviceType.createdAt,
          }
        : ({} as ServiceTypeResponseDto),
      description: walletTransaction.description,
      relatedEntityType: walletTransaction.relatedEntityType,
      relatedEntityId: walletTransaction.relatedEntityId,
      createdAt: walletTransaction.createdAt,
    };
  }

  static toResponseDtoArray(
    walletTransactions: WalletTransaction[],
  ): WalletTransactionResponseDto[] {
    return walletTransactions.map((walletTransaction) => this.toResponseDto(walletTransaction));
  }
}
