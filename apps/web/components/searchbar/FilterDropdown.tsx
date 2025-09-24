'use client';

import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { BrandFilter } from './BrandFilter';
import { PriceFilter } from './PriceFilter';

interface FilterDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  onPriceRangeSelect: (priceTag: any) => void;
  onClearFilters: () => void;
  className?: string;
}

export function FilterDropdown({
  isOpen,
  onToggle,
  onClose,
  selectedBrand,
  onBrandChange,
  onPriceRangeSelect,
  onClearFilters,
  className
}: FilterDropdownProps) {
  const filterRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div ref={filterRef} className={`relative border-l border-emerald-600 flex-shrink-0 z-10 ${className}`}>
      <Button
        variant="outline"
        onClick={onToggle}
        className="border-0 bg-transparent text-gray-700 hover:bg-[#7EF2DD] transition-colors duration-200 px-4 py-3 rounded-none h-full flex items-center gap-2"
      >
        <Filter className="h-4 w-4 text-emerald-600" />
        <span className="text-sm font-medium">Bộ lọc</span>
      </Button>

      {/* Filter Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-emerald-600 rounded-xl shadow-lg z-20 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-emerald-100 border-b border-emerald-600">
            <h3 className="text-sm font-semibold text-gray-800">Bộ lọc tìm kiếm</h3>
          </div>

          <div className="p-4 space-y-4">
            {/* Brand Filter */}
            <BrandFilter
              selectedBrand={selectedBrand}
              onBrandChange={onBrandChange}
            />

            {/* Price Range Filter */}
            <PriceFilter
              onPriceRangeSelect={onPriceRangeSelect}
            />
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex gap-2">
              <Button
                onClick={onClearFilters}
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
              >
                Xóa bộ lọc
              </Button>
              <Button
                onClick={onClose}
                size="sm"
                className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
