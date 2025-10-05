'use client';

import React, { useState } from 'react';
import { PRICE_CONSTANTS, DROPDOWN_TITLES } from './constants/dropdownConstants';
import { DropdownButtons } from './components/DropdownButtons';

interface PriceFilterDropdownProps {
  onApply: (priceRange: { min: number; max: number }) => void;
  onClose: () => void;
  currentRange?: { min: number; max: number };
}

export function PriceFilterDropdown({ onApply, onClose, currentRange }: PriceFilterDropdownProps) {
  const [priceRange, setPriceRange] = useState({
    min: currentRange?.min || PRICE_CONSTANTS.MIN_PRICE,
    max: currentRange?.max || PRICE_CONSTANTS.DEFAULT_MAX_PRICE
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
    const defaultRange = {
      min: PRICE_CONSTANTS.MIN_PRICE,
      max: PRICE_CONSTANTS.DEFAULT_MAX_PRICE
    };
    setPriceRange(defaultRange);
    onApply(defaultRange);
    onClose();
  };

  return (
    <div className="w-80 bg-white border border-emerald-600 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">{DROPDOWN_TITLES.PRICE}</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Từ: {formatPrice(priceRange.min)}</span>
              <span>Đến: {formatPrice(priceRange.max)}</span>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min={PRICE_CONSTANTS.MIN_PRICE}
                max={PRICE_CONSTANTS.MAX_PRICE}
                step={PRICE_CONSTANTS.STEP}
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <input
                type="range"
                min={PRICE_CONSTANTS.MIN_PRICE}
                max={PRICE_CONSTANTS.MAX_PRICE}
                step={PRICE_CONSTANTS.STEP}
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          <DropdownButtons
            onClear={handleClear}
            onCancel={onClose}
            onApply={handleApply}
          />
        </div>
      </div>
    </div>
  );
}
