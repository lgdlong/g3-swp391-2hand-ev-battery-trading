# Filter Dropdown Components - Complete Implementation Q&A

## Question: Implement Individual Filter Dropdown Components

**Prompt:**
Tôi cần tạo các dropdown filter components riêng biệt cho từng tiêu chí lọc (Price, Range, Brand, Capacity, Cycles, Health, Battery Brand) với các tính năng:
- Dropdown UI với options
- Apply và Clear buttons
- State management cho selected values
- Integration với FilterButtons system

**Answer:**

### 1. PriceFilterDropdown Component

```typescript
// apps/web/components/breadcrumb-filter/PriceFilterDropdown.tsx
'use client';

import React, { useState } from 'react';
import { PRICE_CONSTANTS, DROPDOWN_TITLES } from './constants/dropdownConstants';
import { DropdownButtons } from './components/DropdownButtons';

interface PriceFilterDropdownProps {
  onApply: (priceRange: { min: number | null; max: number | null }) => void;
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
    // Clear the price filter completely
    onApply({ min: null, max: null });
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
              {/* Min price input */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Giá tối thiểu</label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  min={PRICE_CONSTANTS.MIN_PRICE}
                  max={PRICE_CONSTANTS.MAX_PRICE}
                />
              </div>

              {/* Max price input */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Giá tối đa</label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  min={PRICE_CONSTANTS.MIN_PRICE}
                  max={PRICE_CONSTANTS.MAX_PRICE}
                />
              </div>

              {/* Range slider (optional) */}
              <div className="pt-2">
                <input
                  type="range"
                  min={PRICE_CONSTANTS.MIN_PRICE}
                  max={PRICE_CONSTANTS.MAX_PRICE}
                  step={PRICE_CONSTANTS.STEP}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <DropdownButtons
            onClear={handleClear}
            onCancel={onClose}
            onApply={handleApply}
            showClearButton={true}
          />
        </div>
      </div>
    </div>
  );
}
```

### 2. RangeFilterDropdown Component

```typescript
// apps/web/components/breadcrumb-filter/RangeFilterDropdown.tsx
'use client';

import React, { useState } from 'react';
import { RANGE_OPTIONS, DROPDOWN_TITLES } from './constants/dropdownConstants';
import { DropdownButtons } from './components/DropdownButtons';

interface RangeFilterDropdownProps {
  onApply: (range: string) => void;
  onClose: () => void;
  currentRange?: string;
}

export function RangeFilterDropdown({ onApply, onClose, currentRange }: RangeFilterDropdownProps) {
  const [selectedRange, setSelectedRange] = useState(currentRange || '');

  const handleApply = () => {
    onApply(selectedRange);
    onClose();
  };

  const handleClear = () => {
    setSelectedRange('');
    onApply('');
    onClose();
  };

  return (
    <div className="w-80 bg-white border border-emerald-600 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">{DROPDOWN_TITLES.RANGE}</h3>

          <div className="space-y-2">
            {RANGE_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="range"
                  value={option.value}
                  checked={selectedRange === option.value}
                  onChange={(e) => setSelectedRange(e.target.value)}
                  className="w-3 h-3 text-blue-600"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>

          <DropdownButtons
            onClear={handleClear}
            onCancel={onClose}
            onApply={handleApply}
            showClearButton={true}
          />
        </div>
      </div>
    </div>
  );
}
```

### 3. BrandFilterDropdown Component

```typescript
// apps/web/components/breadcrumb-filter/BrandFilterDropdown.tsx
'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCarBrands, getBikeBrands } from '@/lib/api/catalogApi';
import { DROPDOWN_TITLES } from './constants/dropdownConstants';
import { DropdownButtons } from './components/DropdownButtons';

interface BrandFilterDropdownProps {
  onApply: (brand: string) => void;
  onClose: () => void;
  currentBrand?: string;
}

export function BrandFilterDropdown({ onApply, onClose, currentBrand = '' }: BrandFilterDropdownProps) {
  const [selectedBrand, setSelectedBrand] = useState(currentBrand);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter brands based on search query
  const filteredBrands = React.useMemo(() => {
    if (!searchQuery) return brands;
    return brands.filter(brand => 
      brand.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [brands, searchQuery]);

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
          <h3 className="text-sm font-semibold text-gray-900">{DROPDOWN_TITLES.BRAND}</h3>

          {/* Search input */}
          <input
            type="text"
            placeholder="Tìm kiếm thương hiệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />

          {/* Brand list */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredBrands.map((brand) => (
              <label key={brand} className="flex items-center space-x-2 cursor-pointer">
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
            ))}
          </div>

          <DropdownButtons
            onClear={handleClear}
            onCancel={onClose}
            onApply={handleApply}
            showClearButton={true}
          />
        </div>
      </div>
    </div>
  );
}
```

### 4. CapacityFilterDropdown Component

```typescript
// apps/web/components/breadcrumb-filter/CapacityFilterDropdown.tsx
'use client';

import React, { useState } from 'react';
import { CAPACITY_OPTIONS, DROPDOWN_TITLES } from './constants/dropdownConstants';
import { DropdownButtons } from './components/DropdownButtons';

interface CapacityFilterDropdownProps {
  onApply: (capacity: string) => void;
  onClose: () => void;
  currentCapacity?: string;
}

export function CapacityFilterDropdown({ onApply, onClose, currentCapacity = '' }: CapacityFilterDropdownProps) {
  const [selectedCapacity, setSelectedCapacity] = useState(currentCapacity);

  const handleApply = () => {
    onApply(selectedCapacity);
    onClose();
  };

  const handleClear = () => {
    setSelectedCapacity('');
    onApply('');
    onClose();
  };

  return (
    <div className="w-80 bg-white border border-emerald-600 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">{DROPDOWN_TITLES.CAPACITY}</h3>

          <div className="space-y-2">
            {CAPACITY_OPTIONS.map((capacity) => (
              <label key={capacity.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="capacity"
                  value={capacity.value}
                  checked={selectedCapacity === capacity.value}
                  onChange={(e) => setSelectedCapacity(e.target.value)}
                  className="w-3 h-3 text-emerald-600"
                />
                <span className="text-sm text-gray-700">{capacity.label}</span>
              </label>
            ))}
          </div>

          <DropdownButtons
            onClear={handleClear}
            onCancel={onClose}
            onApply={handleApply}
            showClearButton={true}
          />
        </div>
      </div>
    </div>
  );
}
```

### 5. CyclesFilterDropdown Component

```typescript
// apps/web/components/breadcrumb-filter/CyclesFilterDropdown.tsx
'use client';

import React, { useState } from 'react';
import { CYCLES_OPTIONS, DROPDOWN_TITLES } from './constants/dropdownConstants';
import { DropdownButtons } from './components/DropdownButtons';

interface CyclesFilterDropdownProps {
  onApply: (cycles: string) => void;
  onClose: () => void;
  currentCycles?: string;
}

export function CyclesFilterDropdown({ onApply, onClose, currentCycles = '' }: CyclesFilterDropdownProps) {
  const [selectedCycles, setSelectedCycles] = useState(currentCycles);

  const handleApply = () => {
    onApply(selectedCycles);
    onClose();
  };

  const handleClear = () => {
    setSelectedCycles('');
    onApply('');
    onClose();
  };

  return (
    <div className="w-80 bg-white border border-emerald-600 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">{DROPDOWN_TITLES.CYCLES}</h3>

          <div className="space-y-2">
            {CYCLES_OPTIONS.map((cycle) => (
              <label key={cycle.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="cycles"
                  value={cycle.value}
                  checked={selectedCycles === cycle.value}
                  onChange={(e) => setSelectedCycles(e.target.value)}
                  className="w-3 h-3 text-emerald-600"
                />
                <span className="text-sm text-gray-700">{cycle.label}</span>
              </label>
            ))}
          </div>

          <DropdownButtons
            onClear={handleClear}
            onCancel={onClose}
            onApply={handleApply}
            showClearButton={true}
          />
        </div>
      </div>
    </div>
  );
}
```

### 6. HealthFilterDropdown Component

```typescript
// apps/web/components/breadcrumb-filter/HealthFilterDropdown.tsx
'use client';

import React, { useState } from 'react';
import { HEALTH_OPTIONS, DROPDOWN_TITLES } from './constants/dropdownConstants';
import { DropdownButtons } from './components/DropdownButtons';

interface HealthFilterDropdownProps {
  onApply: (health: string) => void;
  onClose: () => void;
  currentHealth?: string;
}

export function HealthFilterDropdown({ onApply, onClose, currentHealth = '' }: HealthFilterDropdownProps) {
  const [selectedHealth, setSelectedHealth] = useState(currentHealth);

  const handleApply = () => {
    onApply(selectedHealth);
    onClose();
  };

  const handleClear = () => {
    setSelectedHealth('');
    onApply('');
    onClose();
  };

  return (
    <div className="w-80 bg-white border border-emerald-600 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">{DROPDOWN_TITLES.HEALTH}</h3>

          <div className="space-y-2">
            {HEALTH_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="health"
                  value={option.value}
                  checked={selectedHealth === option.value}
                  onChange={(e) => setSelectedHealth(e.target.value)}
                  className="w-3 h-3 text-emerald-600"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>

          <DropdownButtons
            onClear={handleClear}
            onCancel={onClose}
            onApply={handleApply}
            showClearButton={true}
          />
        </div>
      </div>
    </div>
  );
}
```

### 7. BatteryBrandFilterDropdown Component

```typescript
// apps/web/components/breadcrumb-filter/BatteryBrandFilterDropdown.tsx
'use client';

import React, { useState } from 'react';
import { BATTERY_BRAND_OPTIONS, DROPDOWN_TITLES } from './constants/dropdownConstants';
import { DropdownButtons } from './components/DropdownButtons';

interface BatteryBrandFilterDropdownProps {
  onApply: (brand: string) => void;
  onClose: () => void;
  currentBrand?: string;
}

export function BatteryBrandFilterDropdown({ onApply, onClose, currentBrand = '' }: BatteryBrandFilterDropdownProps) {
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

          <div className="space-y-2 max-h-60 overflow-y-auto">
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
            showClearButton={true}
          />
        </div>
      </div>
    </div>
  );
}
```

### 8. DropdownButtons Component (Shared)

```typescript
// apps/web/components/breadcrumb-filter/components/DropdownButtons.tsx
'use client';

import React from 'react';

interface DropdownButtonProps {
  onClear: () => void;
  onCancel: () => void;
  onApply: () => void;
  showClearButton?: boolean;
}

export function DropdownButtons({
  onClear,
  onCancel,
  onApply,
  showClearButton = true
}: DropdownButtonProps) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2 border-t">
      {showClearButton && (
        <button
          onClick={onClear}
          className="px-3 py-1 text-xs text-red-600 hover:text-red-800 transition-colors"
        >
          Xóa bộ lọc
        </button>
      )}
      <button
        onClick={onCancel}
        className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
      >
        Hủy
      </button>
      <button
        onClick={onApply}
        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
      >
        Áp dụng
      </button>
    </div>
  );
}
```

### 9. Filter Constants

```typescript
// apps/web/components/breadcrumb-filter/constants/dropdownConstants.ts
// Constants cho các options trong dropdown filters
export const CYCLES_OPTIONS = [
  { value: '<1000', label: 'Dưới 1,000 chu kỳ' },
  { value: '1000-2000', label: '1,000 - 2,000 chu kỳ' },
  { value: '2000-3000', label: '2,000 - 3,000 chu kỳ' },
  { value: '3000-4000', label: '3,000 - 4,000 chu kỳ' },
  { value: '>4000', label: 'Trên 4,000 chu kỳ' }
] as const;

export const CAPACITY_OPTIONS = [
  { value: '<30', label: 'Dưới 30kWh' },
  { value: '30-50', label: '30kWh - 50kWh' },
  { value: '50-70', label: '50kWh - 70kWh' },
  { value: '70-100', label: '70kWh - 100kWh' },
  { value: '>100', label: 'Trên 100kWh' }
] as const;

export const RANGE_OPTIONS = [
  { value: '<300', label: 'Dưới 300km/lần sạc' },
  { value: '300-600', label: '300km - 600km/lần sạc' },
  { value: '>600', label: 'Trên 600km/lần sạc' }
] as const;

export const HEALTH_OPTIONS = [
  { value: 'excellent', label: 'Xuất sắc (90-100%)' },
  { value: 'very-good', label: 'Rất tốt (80-89%)' },
  { value: 'good', label: 'Tốt (70-79%)' },
  { value: 'fair', label: 'Khá (60-69%)' },
  { value: 'poor', label: 'Kém (dưới 60%)' }
] as const;

export const BATTERY_BRAND_OPTIONS = [
  { value: 'panasonic', label: 'Panasonic' },
  { value: 'lg-chem', label: 'LG Chem' },
  { value: 'samsung-sdi', label: 'Samsung SDI' },
  { value: 'catl', label: 'CATL' },
  { value: 'tesla', label: 'Tesla' },
  { value: 'byd', label: 'BYD' },
  { value: 'sk-innovation', label: 'SK Innovation' },
  { value: 'northvolt', label: 'Northvolt' },
  { value: 'calb', label: 'CALB' },
  { value: 'eve-energy', label: 'EVE Energy' }
] as const;

// Constants cho price range
export const PRICE_CONSTANTS = {
  MIN_PRICE: 0,
  MAX_PRICE: 1500000000,
  DEFAULT_MAX_PRICE: 150000000000,
  STEP: 10000000
} as const;

// Constants cho dropdown titles
export const DROPDOWN_TITLES = {
  CYCLES: 'Số chu kỳ',
  CAPACITY: 'Dung lượng pin',
  RANGE: 'Quãng đường di chuyển trên 1 lần sạc',
  HEALTH: 'Tình trạng pin',
  PRICE: 'Chọn khoảng giá',
  BRAND: 'Hãng xe điện',
  BATTERY_BRAND: 'Thương hiệu pin'
} as const;
```

### Key Features:
- ✅ **Consistent UI**: Tất cả dropdown có cùng style và layout
- ✅ **State Management**: Mỗi dropdown quản lý state riêng
- ✅ **Apply/Clear**: Có nút Apply và Clear cho mỗi filter
- ✅ **Current Value**: Hiển thị giá trị đã chọn trước đó
- ✅ **Radio Selection**: Sử dụng radio buttons cho single selection
- ✅ **Search Functionality**: Brand filter có search (cho BrandFilterDropdown)
- ✅ **API Integration**: Brand filter fetch từ API
- ✅ **Scrollable Lists**: Dropdown có scroll cho danh sách dài
- ✅ **Reusable Components**: DropdownButtons component được tái sử dụng

