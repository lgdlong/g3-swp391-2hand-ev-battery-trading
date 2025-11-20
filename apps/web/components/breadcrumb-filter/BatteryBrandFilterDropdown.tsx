'use client';

import React, { useState, useEffect } from 'react';
import { DROPDOWN_TITLES } from './constants/dropdownConstants';
import { DropdownButtons } from './components/DropdownButtons';
import { getBatteryBrands } from '@/lib/api/catalogApi';
import { Brand } from '@/types/catalog';

interface BrandFilterDropdownProps {
  onApply: (brand: string) => void;
  onClose: () => void;
  currentBrand?: string;
}

export function BatteryBrandFilterDropdown({
  onApply,
  onClose,
  currentBrand = '',
}: BrandFilterDropdownProps) {
  const [selectedBrand, setSelectedBrand] = useState(currentBrand);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await getBatteryBrands();
        setBrands(data);
      } catch (error) {
        console.error('Error fetching battery brands:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

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

          {loading ? (
            <div className="text-sm text-gray-500 py-2">Đang tải...</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {brands.length === 0 ? (
                <div className="text-sm text-gray-500 py-2">Không có thương hiệu nào</div>
              ) : (
                brands.map((brand) => (
                  <label key={brand.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="brand"
                      value={brand.id.toString()}
                      checked={selectedBrand === brand.id.toString()}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-3 h-3 text-emerald-600"
                    />
                    <span className="text-sm text-gray-700">{brand.name}</span>
                  </label>
                ))
              )}
            </div>
          )}

          <DropdownButtons onClear={handleClear} onCancel={onClose} onApply={handleApply} />
        </div>
      </div>
    </div>
  );
}
