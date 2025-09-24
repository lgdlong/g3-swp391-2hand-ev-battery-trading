'use client';

import React from 'react';

interface BrandFilterProps {
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  className?: string;
}

const brands = [
  'Tesla',
  'BYD',
  'VinFast',
  'BMW',
  'Mercedes',
  'Audi',
  'Porsche',
  'Hyundai',
  'Kia',
  'Nissan',
  'Toyota',
  'Honda'
];

export function BrandFilter({ selectedBrand, onBrandChange, className }: BrandFilterProps) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-gray-600 mb-2 block">Hãng xe</label>
      <div className="flex flex-wrap gap-2">
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => onBrandChange(selectedBrand === brand ? '' : brand)}
            className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 border ${
              selectedBrand === brand
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border-emerald-300'
            }`}
          >
            {brand}
          </button>
        ))}
      </div>
    </div>
  );
}
