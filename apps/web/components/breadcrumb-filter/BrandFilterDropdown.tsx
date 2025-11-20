'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCarBrands, getBikeBrands } from '@/lib/api/catalogApi';

interface BrandFilterDropdownProps {
  onApply: (brandId: number | null) => void;
  onClose: () => void;
  currentBrandId?: number;
}

export function BrandFilterDropdown({
  onApply,
  onClose,
  currentBrandId,
}: BrandFilterDropdownProps) {
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(currentBrandId ?? null);

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

  // Combine and deduplicate brands by ID
  const brands = React.useMemo(() => {
    const allBrands = [...carBrands, ...bikeBrands];
    const uniqueBrands = allBrands.filter(
      (brand, index, self) => index === self.findIndex((b) => b.id === brand.id),
    );
    return uniqueBrands.sort((a, b) => a.name.localeCompare(b.name));
  }, [carBrands, bikeBrands]);

  const handleApply = () => {
    onApply(selectedBrandId);
    onClose();
  };

  const handleClear = () => {
    setSelectedBrandId(null);
    onApply(null);
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
                <label
                  key={brand.id}
                  className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="brand"
                    value={brand.id}
                    checked={selectedBrandId === brand.id}
                    onChange={() => setSelectedBrandId(brand.id)}
                    className="w-3 h-3 text-emerald-600"
                  />
                  <span className="text-sm text-gray-700">{brand.name}</span>
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
