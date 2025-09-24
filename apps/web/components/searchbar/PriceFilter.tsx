'use client';

import React from 'react';

interface PriceFilterProps {
  onPriceRangeSelect: (priceTag: any) => void;
  className?: string;
}

const priceRanges = [
  { label: 'Dưới 50 triệu', min: '0', max: '50000000' },
  { label: '50-100 triệu', min: '50000000', max: '100000000' },
  { label: '100-200 triệu', min: '100000000', max: '200000000' },
  { label: '200-500 triệu', min: '200000000', max: '500000000' },
  { label: 'Trên 500 triệu', min: '500000000', max: '' }
];

export function PriceFilter({ onPriceRangeSelect, className }: PriceFilterProps) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-gray-600 mb-2 block">Khoảng giá</label>
      <div className="flex flex-wrap gap-2">
        {priceRanges.map((priceTag) => (
          <button
            key={priceTag.label}
            onClick={() => onPriceRangeSelect(priceTag)}
            className="px-3 py-1 text-xs bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-full transition-colors duration-200 border border-emerald-300"
          >
            {priceTag.label}
          </button>
        ))}
      </div>
    </div>
  );
}
