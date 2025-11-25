'use client';

import React, { useState, useEffect } from 'react';
import { X, Coins, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createTopupPayment, PayosCreatePaymentResponse } from '@/lib/api/walletApi';
import { toast } from 'sonner';

interface TopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number; // Amount in VND to pre-fill
  returnUrl?: string; // Custom return URL after payment
}

const MIN_TOPUP_AMOUNT = 2000;
const MAX_TOPUP_AMOUNT = 25000000000; // 25 billion
const SAMPLE_TOPUP = 10000;
const SAMPLE_TOPUP_STR = '10000';
const QUICK_ADD_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

export function TopupModal({ isOpen, onClose, initialAmount, returnUrl }: TopupModalProps) {
  const [amount, setAmount] = useState<number>(initialAmount || SAMPLE_TOPUP);
  const [customAmount, setCustomAmount] = useState<string>(
    initialAmount ? initialAmount.toString() : SAMPLE_TOPUP_STR,
  );
  const [isLoading, setIsLoading] = useState(false);

  // Update amount when initialAmount changes
  useEffect(() => {
    if (isOpen && initialAmount) {
      setAmount(initialAmount);
      setCustomAmount(initialAmount.toString());
    } else if (isOpen && !initialAmount) {
      setAmount(SAMPLE_TOPUP);
      setCustomAmount(SAMPLE_TOPUP_STR);
    }
  }, [isOpen, initialAmount]);

  if (!isOpen) return null;

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const handleQuickAdd = (addAmount: number) => {
    const newAmount = amount + addAmount;
    if (newAmount > MAX_TOPUP_AMOUNT) {
      toast.error(`Số tiền tối đa là ${formatVND(MAX_TOPUP_AMOUNT)} ₫`);
      return;
    }
    setAmount(newAmount);
    setCustomAmount(newAmount.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const numValue = parseInt(value) || 0;

    if (numValue > MAX_TOPUP_AMOUNT) {
      toast.error(`Số tiền tối đa là ${formatVND(MAX_TOPUP_AMOUNT)} ₫`);
      return;
    }

    setCustomAmount(value);
    setAmount(numValue);
  };

  const handleTopup = async () => {
    if (amount < MIN_TOPUP_AMOUNT) {
      toast.error(`Số tiền nạp tối thiểu là ${formatVND(MIN_TOPUP_AMOUNT)} ₫`);
      return;
    }

    if (amount > MAX_TOPUP_AMOUNT) {
      toast.error(`Số tiền tối đa là ${formatVND(MAX_TOPUP_AMOUNT)} ₫`);
      return;
    }

    setIsLoading(true);
    try {
      const response: PayosCreatePaymentResponse = await createTopupPayment({
        amount,
        returnUrl: returnUrl || `${window.location.origin}/checkout/result`,
        cancelUrl: `${window.location.origin}/wallet`,
      });

      console.log('Topup response:', response);

      if (response?.data?.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        toast.error('Không thể tạo link thanh toán');
      }
    } catch (error: unknown) {
      console.error('Topup error:', error);
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(errorMessage || 'Có lỗi xảy ra khi nạp tiền');
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
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Nạp tiền vào ví</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Nhập số tiền bạn muốn nạp
            </label>
            <div className="relative">
              <input
                type="text"
                value={customAmount ? formatVND(parseInt(customAmount)) : ''}
                onChange={handleCustomAmountChange}
                className="w-full px-4 py-4 text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#048C73] transition-colors text-center"
                placeholder="50.000"
                disabled={isLoading}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">
                ₫
              </span>
            </div>
          </div>

          {/* Quick Add Amounts */}
          <div className="grid grid-cols-3 gap-2">
            {QUICK_ADD_AMOUNTS.map((addAmount) => (
              <button
                key={addAmount}
                onClick={() => handleQuickAdd(addAmount)}
                disabled={isLoading}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                +{formatVND(addAmount)} ₫
              </button>
            ))}
          </div>

          {/* Note */}
          <div className="text-xs text-gray-500 text-center leading-tight">
            Bằng việc thanh toán dịch vụ, bạn đồng ý với{' '}
            <span className="text-[#048C73] font-medium cursor-pointer hover:underline">
              Điều khoản sử dụng
            </span>{' '}
            của
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50 rounded-b-2xl">
          <div>
            <p className="text-xs text-gray-500 mb-1">TỔNG TIỀN</p>
            <p className="text-2xl font-bold text-[#048C73]">{formatVND(amount)} ₫</p>
          </div>
          <Button
            onClick={handleTopup}
            disabled={isLoading || amount < MIN_TOPUP_AMOUNT}
            className="bg-[#048C73] hover:bg-[#037060] text-white px-6 py-5 text-base font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Coins className="h-5 w-5 mr-2" />
                Thanh toán
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
