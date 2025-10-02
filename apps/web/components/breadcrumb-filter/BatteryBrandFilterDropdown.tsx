'use client';

import React, { useState } from 'react';

interface BrandFilterDropdownProps {
  onApply: (brand: string) => void;
  onClose: () => void;
  currentBrand?: string;
}

export function BatteryBrandFilterDropdown({ onApply, onClose, currentBrand = '' }: BrandFilterDropdownProps) {
  const [selectedBrand, setSelectedBrand] = useState(currentBrand);

  const brands = [
    { value: 'panasonic', label: 'Panasonic' },
    { value: 'lg', label: 'LG Chem' },
    { value: 'samsung', label: 'Samsung SDI' },
    { value: 'catl', label: 'CATL' },
    { value: 'tesla', label: 'Tesla' }
  ];

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
          <h3 className="text-sm font-semibold text-gray-900">Thương hiệu pin</h3>

          <div className="space-y-2">
            {brands.map((brand) => (
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

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
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
