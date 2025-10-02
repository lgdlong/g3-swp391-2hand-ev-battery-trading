'use client';

import React, { useState } from 'react';

interface PriceFilterDropdownProps {
  onApply: (priceRange: { min: number; max: number }) => void;
  onClose: () => void;
  currentRange?: { min: number; max: number };
}

export function PriceFilterDropdown({ onApply, onClose, currentRange }: PriceFilterDropdownProps) {
  const [priceRange, setPriceRange] = useState({
    min: currentRange?.min || 0,
    max: currentRange?.max || 150000000000
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleApply = () => {
    onApply(priceRange);
    onClose();
  };

  const handleClear = () => {
    setPriceRange({ min: 0, max: 150000000000 });
    onApply({ min: 0, max: 150000000000 });
    onClose();
  };

  return (
    <div className="w-80 bg-white border border-emerald-600 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Chọn khoảng giá</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Từ: {formatPrice(priceRange.min)}</span>
              <span>Đến: {formatPrice(priceRange.max)}</span>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="1500000000"
                step="10000000"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <input
                type="range"
                min="0"
                max="15000000000"
                step="10000000"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <button
              onClick={handleClear}
              className="px-3 py-1 text-xs text-red-600 hover:text-red-800 transition-colors"
            >
              Xóa bộ lọc
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleApply}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
