'use client';

import React, { useState } from 'react';
import { BATTERY_BRAND_OPTIONS, DROPDOWN_TITLES } from './constants/dropdownConstants';
import { DropdownButtons } from './components/DropdownButtons';

interface BrandFilterDropdownProps {
  onApply: (brand: string) => void;
  onClose: () => void;
  currentBrand?: string;
}

export function BatteryBrandFilterDropdown({ onApply, onClose, currentBrand = '' }: BrandFilterDropdownProps) {
  const [selectedBrand, setSelectedBrand] = useState(currentBrand);

  const handleApply = () => {
    onApply(selectedBrand);
    onClose();
  };

  const handleClear = () => {
    setSelectedBrand('');
    onApply('');
    onClose();
  };

  return (
    <div className="w-80 bg-white border border-emerald-600 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">{DROPDOWN_TITLES.BATTERY_BRAND}</h3>

          <div className="space-y-2">
            {BATTERY_BRAND_OPTIONS.map((brand) => (
              <label key={brand.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="brand"
                  value={brand.value}
                  checked={selectedBrand === brand.value}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-3 h-3 text-emerald-600"
                />
                <span className="text-sm text-gray-700">{brand.label}</span>
              </label>
            ))}
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
