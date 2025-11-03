'use client';

import React, { useState, useEffect } from 'react';
import { X, Coins, Loader2, Wallet, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deductWallet, getMyWallet, Wallet as WalletType } from '@/lib/api/walletApi';
import { getAllFeeTiers, FeeTier } from '@/lib/api/feeTiersApi';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { TopupModal } from '@/components/TopupModal';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  priceVnd: number; // Price in VND from the post
  onSuccess: () => Promise<void>; // Callback to create post after successful deposit
}

export function DepositModal({ isOpen, onClose, priceVnd, onSuccess }: DepositModalProps) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [feeTier, setFeeTier] = useState<FeeTier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);

  // Load wallet and fee tier data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setIsLoadingData(true);
      try {
        // Load wallet
        const walletData = await getMyWallet();
        setWallet(walletData);

        // Load fee tiers and find matching tier
        const feeTiers = await getAllFeeTiers();
        const activeTiers = feeTiers.filter((tier) => tier.active);

        // Find tier that matches priceVnd
        const matchingTier = activeTiers.find((tier) => {
          const minPrice = parseFloat(tier.minPrice);
          const maxPrice = tier.maxPrice ? parseFloat(tier.maxPrice) : Infinity;
          return priceVnd >= minPrice && priceVnd <= maxPrice;
        });

        if (matchingTier) {
          setFeeTier(matchingTier);
        } else {
          toast.error('Không tìm thấy bảng phí phù hợp với giá bài đăng');
          onClose();
        }
      } catch (error: unknown) {
        console.error('Error loading data:', error);
        type ApiError = { response?: { data?: { message?: string } }; message?: string };
        const err = error as ApiError;
        toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
        onClose();
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [isOpen, priceVnd, onClose]);

  // Reload wallet data when TopupModal closes (in case user topped up)
  useEffect(() => {
    if (!isTopupModalOpen && isOpen) {
      const reloadWallet = async () => {
        try {
          const walletData = await getMyWallet();
          setWallet(walletData);
        } catch (error) {
          console.error('Error reloading wallet:', error);
        }
      };
      reloadWallet();
    }
  }, [isTopupModalOpen, isOpen]);

  if (!isOpen) return null;

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Calculate deposit coin based on fee tier
  const calculateDepositCoin = (): number => {
    if (!feeTier) return 0;
    const depositRate = parseFloat(feeTier.depositRate);
    return Math.round(priceVnd * depositRate);
  };

  const depositCoin = calculateDepositCoin();
  const currentBalance = wallet ? parseFloat(wallet.balance) : 0;
  const remainingBalance = currentBalance - depositCoin;

  const handleDeposit = async () => {
    if (!user?.id) {
      toast.error('Không tìm thấy thông tin người dùng');
      return;
    }

    if (remainingBalance < 0) {
      toast.error('Số dư ví không đủ để đặt cọc');
      return;
    }

    setIsLoading(true);
    try {
      // Generate paymentOrderId (using timestamp for uniqueness)
      const paymentOrderId = `deposit-${Date.now()}`;

      // Deduct wallet
      await deductWallet(user.id, {
        amount: depositCoin,
        description: 'Trừ tiền phí đặt cọc đăng bài',
        paymentOrderId,
      });

      toast.success('Đặt cọc thành công!');

      // Update wallet balance in local state
      if (wallet) {
        setWallet({
          ...wallet,
          balance: remainingBalance.toString(),
        });
      }

      // Call onSuccess callback (which will create the post)
      await onSuccess();

      // Close modal after successful post creation
      onClose();
    } catch (error: unknown) {
      console.error('Deduct error:', error);
      type ApiError = { response?: { data?: { message?: string } }; message?: string };
      const err = error as ApiError;
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi trừ cọc');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Đặt cọc đăng bài</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading || isLoadingData}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        {isLoadingData ? (
          <div className="p-6 flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#048C73]" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Current Wallet Balance */}
            <div className="bg-gradient-to-r from-[#048C73]/10 to-[#048C73]/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-[#048C73] rounded-full flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Số dư hiện tại</p>
                    <p className="text-lg font-bold text-[#048C73]">
                      {formatVND(currentBalance)} Coin
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Deposit Calculation */}
            <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 rounded-xl p-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giá bài đăng</span>
                  <span className="font-semibold text-gray-900">{formatVND(priceVnd)} ₫</span>
                </div>
                {feeTier && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tỷ lệ đặt cọc</span>
                    <span className="font-semibold text-gray-900">
                      {(parseFloat(feeTier.depositRate) * 100).toFixed(2)}%
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Số coin đặt cọc</span>
                    <span className="text-lg font-bold text-amber-600">
                      {formatVND(depositCoin)} Coin
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Remaining Balance */}
            <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Số dư còn lại sau khi trừ</p>
                  <p
                    className={`text-xl font-bold ${
                      remainingBalance < 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {formatVND(Math.max(0, remainingBalance))} Coin
                  </p>
                </div>
              </div>
            </div>

            {/* Warning if insufficient balance */}
            {remainingBalance < 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">
                  ⚠️ Số dư ví không đủ để đặt cọc. Vui lòng nạp thêm coin.
                </p>
              </div>
            )}

            {/* Note */}
            <div className="text-xs text-gray-500 text-center">
              Bằng việc đặt cọc, bạn đồng ý với{' '}
              <span className="text-[#048C73] font-medium cursor-pointer hover:underline">
                Điều khoản sử dụng
              </span>{' '}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 rounded-b-2xl">
          <div>
            <p className="text-xs text-gray-500 mb-1">TỔNG CỌC</p>
            <p className="text-2xl font-bold text-amber-600">{formatVND(depositCoin)} Coin</p>
          </div>
          <div className="flex items-center gap-3">
            {remainingBalance < 0 && (
              <Button
                onClick={() => setIsTopupModalOpen(true)}
                disabled={isLoading || isLoadingData}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-6 text-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nạp coin
              </Button>
            )}
            <Button
              onClick={handleDeposit}
              disabled={isLoading || isLoadingData || remainingBalance < 0}
              className="bg-[#048C73] hover:bg-[#037060] text-white px-8 py-6 text-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Coins className="h-5 w-5 mr-2" />
                  Đặt cọc
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Topup Modal */}
      <TopupModal isOpen={isTopupModalOpen} onClose={() => setIsTopupModalOpen(false)} />
    </div>
  );
}
