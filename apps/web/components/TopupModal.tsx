'use client';

import React, { useState } from 'react';
import { X, Coins, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createTopupPayment } from '@/lib/api/walletApi';
import { toast } from 'sonner';

interface TopupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AMOUNTS = [25000, 50000, 100000, 500000, 1000000, 2000000];

export function TopupModal({ isOpen, onClose }: TopupModalProps) {
  const [amount, setAmount] = useState<number>(50000);
  const [customAmount, setCustomAmount] = useState<string>('50000');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount(value.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCustomAmount(value);
    setAmount(parseInt(value) || 0);
  };

  const handleTopup = async () => {
    if (amount < 2000) {
      toast.error('Số tiền nạp tối thiểu là 2.000 ₫');
      return;
    }

    setIsLoading(true);
    try {
      const response = await createTopupPayment({
        amount,
        returnUrl: `${window.location.origin}/checkout/result`,
        cancelUrl: `${window.location.origin}/wallet`,
      });

      if (response?.data?.checkoutUrl) {
        // Redirect to PayOS checkout page
        window.location.href = response.data.checkoutUrl;
      } else {
        toast.error('Không thể tạo link thanh toán');
      }
    } catch (error: any) {
      console.error('Topup error:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi nạp coin');
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
          <h2 className="text-2xl font-bold text-gray-900">Quy đổi giá trị nạp</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Nhập số tiền bạn muốn nạp
            </label>
            <div className="relative">
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomAmountChange}
                className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#048C73] transition-colors"
                placeholder="50.000"
                disabled={isLoading}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                ₫
              </span>
            </div>
          </div>

          {/* Preset Amounts */}
          <div className="flex flex-wrap gap-2">
            {PRESET_AMOUNTS.map((presetAmount) => (
              <button
                key={presetAmount}
                onClick={() => handleAmountSelect(presetAmount)}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  amount === presetAmount
                    ? 'bg-[#048C73] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {formatVND(presetAmount)} ₫
              </button>
            ))}
          </div>

          {/* Conversion Info */}
          <div className="bg-gradient-to-r from-[#048C73]/10 to-[#048C73]/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-[#048C73] rounded-full flex items-center justify-center">
                    <Coins className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-1">Tiền mặt</p>
                <p className="text-lg font-bold text-[#048C73]">{formatVND(amount)} ₫</p>
              </div>

              <ArrowRight className="h-5 w-5 text-gray-400 mx-4" />

              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                    <Coins className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-1">Coin</p>
                <p className="text-lg font-bold text-amber-600">{formatVND(amount)} Coin</p>
              </div>
            </div>

            <div className="border-t border-[#048C73]/20 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Số tiền nạp</span>
                <span className="font-semibold text-gray-900">{formatVND(amount)} ₫</span>
              </div>
            </div>
          </div>

          {/* Conversion Rate Info */}
          <div className="bg-[#048C73]/5 rounded-lg p-3">
            <p className="text-xs text-gray-600 text-center">
              Coin nhận được:{' '}
              <span className="font-bold text-[#048C73]">{formatVND(amount)} Coin</span>
            </p>
          </div>

          {/* Note */}
          <div className="text-xs text-gray-500 text-center">
            Bằng việc thanh toán dịch vụ, bạn đồng ý với{' '}
            <span className="text-[#048C73] font-medium cursor-pointer hover:underline">
              Điều khoản sử dụng
            </span>{' '}
            của Chợ Tốt
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 rounded-b-2xl">
          <div>
            <p className="text-xs text-gray-500 mb-1">TỔNG TIỀN</p>
            <p className="text-2xl font-bold text-[#048C73]">{formatVND(amount)} ₫</p>
          </div>
          <Button
            onClick={handleTopup}
            disabled={isLoading || amount < 10000}
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
                Thanh toán
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
