'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCarBrands, getBikeBrands } from '@/lib/api/catalogApi';

interface BrandFilterProps {
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  className?: string;
}

export function BrandFilter({ selectedBrand, onBrandChange, className }: BrandFilterProps) {
  // Fetch car brands
  const { data: carBrands = [] } = useQuery({
    queryKey: ['carBrands'],
    queryFn: getCarBrands,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch bike brands
  const { data: bikeBrands = [] } = useQuery({
    queryKey: ['bikeBrands'],
    queryFn: getBikeBrands,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Combine and deduplicate brands
  const brands = React.useMemo(() => {
    const allBrands = [...carBrands, ...bikeBrands];
    const uniqueBrands = Array.from(new Set(allBrands.map(brand => brand.name)));
    return uniqueBrands.sort();
  }, [carBrands, bikeBrands]);

  return (
    <div className={className}>
      <label className="text-xs font-medium text-gray-600 mb-2 block">Hãng xe</label>
      <div className="flex flex-wrap gap-2">
        {brands.length > 0 ? (
          brands.map((brand) => (
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
          ))
        ) : (
          <div className="text-gray-500 text-xs">Đang tải danh sách hãng xe...</div>
        )}
      </div>
    </div>
  );
}
