'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCarBrands, getBikeBrands } from '@/lib/api/catalogApi';

interface BrandFilterDropdownProps {
  onApply: (brand: string) => void;
  onClose: () => void;
  currentBrand?: string;
}

export function BrandFilterDropdown({ onApply, onClose, currentBrand = '' }: BrandFilterDropdownProps) {
  const [selectedBrand, setSelectedBrand] = useState(currentBrand);

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
          <h3 className="text-sm font-semibold text-gray-900">Hãng xe điện</h3>

          <div className="grid grid-cols-2 gap-2">
            {brands.length > 0 ? (
              brands.map((brand) => (
                <label key={brand} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-emerald-50 transition-colors">
                  <input
                    type="radio"
                    name="brand"
                    value={brand}
                    checked={selectedBrand === brand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-3 h-3 text-emerald-600"
                  />
                  <span className="text-sm text-gray-700">{brand}</span>
                </label>
              ))
            ) : (
              <div className="col-span-2 text-center py-4 text-gray-500 text-sm">
                Đang tải danh sách hãng xe...
              </div>
            )}
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
