import { Button } from '@/components/ui/button';
import { Coins, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WalletBalanceCardProps {
  currentCoins: number;
  depositFee: number;
  hasEnoughCoins: boolean;
  isLoadingWallet: boolean;
  formatCurrency: (amount: number) => string;
  refetchWallet: () => void;
}

export function WalletBalanceCard({
  currentCoins,
  depositFee,
  hasEnoughCoins,
  isLoadingWallet,
  formatCurrency,
  refetchWallet,
}: WalletBalanceCardProps) {
  const router = useRouter();

  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-3">Phương thức thanh toán</h3>
      <div className="p-4 border-2 border-green-500 bg-green-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
              <Coins className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">Coin</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-zinc-600">
                  Số dư:{' '}
                  <strong
                    className={`font-bold ${hasEnoughCoins ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {isLoadingWallet ? '...' : formatCurrency(currentCoins)} ₫
                  </strong>
                </p>
                <button
                  onClick={() => refetchWallet()}
                  className="text-blue-600 hover:text-blue-700"
                  aria-label="Refresh wallet balance"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
          {hasEnoughCoins && (
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      </div>

      {!hasEnoughCoins && (
        <div className="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-900">Không đủ coin</p>
              <p className="text-sm text-orange-700 mt-1">
                Bạn cần nạp thêm {formatCurrency(depositFee - currentCoins)} ₫ để thanh toán.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/wallet')}
                className="mt-2 border-orange-500 text-orange-700 hover:bg-orange-100"
              >
                Nạp coin ngay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
