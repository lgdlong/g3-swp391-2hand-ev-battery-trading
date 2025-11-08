import { DataSource } from 'typeorm';
import { Wallet } from '../../modules/wallets/entities/wallet.entity';

/**
 * Đảm bảo rằng ví của user tồn tại trong transaction hiện tại.
 * Nếu chưa có thì tạo mới (balance = 0).
 *
 * @param manager - Transaction EntityManager (manager từ dataSource.transaction)
 * @param userId - ID của người dùng cần đảm bảo ví
 * @returns Wallet entity (đã có hoặc vừa được tạo)
 */
export async function ensureWalletInTx(
  manager: DataSource['manager'],
  userId: number,
): Promise<Wallet> {
  const walletRepo = manager.getRepository(Wallet);

  let wallet = await walletRepo.findOne({ where: { userId } });

  if (!wallet) {
    wallet = walletRepo.create({
      userId,
      balance: '0', // VND lưu số nguyên, không float
    });
    await walletRepo.save(wallet);
  }

  return wallet;
}
