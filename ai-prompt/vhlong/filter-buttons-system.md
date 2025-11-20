# Filter Buttons System - Complete Implementation Q&A

## Question: Implement Filter Buttons System with Multiple Dropdown Filters

**Prompt:**
Tôi cần tạo hệ thống filter buttons hoàn chỉnh với các dropdown filters cho trang EV và Battery, bao gồm:
- Filter buttons với dropdown cho từng tiêu chí
- Quản lý state của các filters
- Apply và clear filters
- Hiển thị trạng thái đã apply filter
- Hỗ trợ cả EV và Battery sections

**Answer:**

### 1. FilterButtons Component (Main Component)

```typescript
// apps/web/components/breadcrumb-filter/FilterButtons.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { BreadcrumbFilter } from './BreadcrumbFilter';
import { useBreadcrumb } from './useBreadcrumb';
import { useFilterHandlers } from './hooks/useFilterHandlers';
import { DropdownManager } from './components/DropdownManager';
import { ButtonRenderer } from './components/ButtonRenderer';
import { FilterButtonsProps } from './types';

export function FilterButtons({
  className,
  breadcrumbItems = [],
  type = 'ev',
  initialCategory,
  initialSubcategory,
  onSubcategoryChange,
  onFilterChange,
  showFilters = true,
}: FilterButtonsProps) {
  // Use breadcrumb hook
  const { breadcrumbState, setCategory, setSubcategory } = useBreadcrumb(type);

  // Use filter handlers hook
  const {
    appliedFilters,
    showPriceDropdown,
    showRangeDropdown,
    showBrandDropdown,
    showCapacityDropdown,
    showCyclesDropdown,
    showHealthDropdown,
    showBatteryBrandDropdown,
    setShowPriceDropdown,
    setShowRangeDropdown,
    setShowBrandDropdown,
    setShowCapacityDropdown,
    setShowCyclesDropdown,
    setShowHealthDropdown,
    setShowBatteryBrandDropdown,
    handlePriceApply,
    handleRangeApply,
    handleBrandApply,
    handleCapacityApply,
    handleCyclesApply,
    handleHealthApply,
    handleBatteryBrandApply,
    handleFilterClick,
  } = useFilterHandlers(onFilterChange);

  // Use dropdown manager
  const { renderDropdownContent } = DropdownManager({
    showPriceDropdown,
    showRangeDropdown,
    showBrandDropdown,
    showCapacityDropdown,
    showCyclesDropdown,
    showHealthDropdown,
    showBatteryBrandDropdown,
    appliedFilters,
    setShowPriceDropdown,
    setShowRangeDropdown,
    setShowBrandDropdown,
    setShowCapacityDropdown,
    setShowCyclesDropdown,
    setShowHealthDropdown,
    setShowBatteryBrandDropdown,
    handlePriceApply,
    handleRangeApply,
    handleBrandApply,
    handleCapacityApply,
    handleCyclesApply,
    handleHealthApply,
    handleBatteryBrandApply,
  });

  const displayBreadcrumbItems =
    breadcrumbItems.length > 0 ? breadcrumbItems : breadcrumbState.items;
    
  return (
    <div className={cn('w-full bg-white rounded-xl border-gray-200', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {displayBreadcrumbItems.length > 0 && (
          <div className="mb-4 px-2">
            <BreadcrumbFilter items={displayBreadcrumbItems} />
          </div>
        )}
        {showFilters && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Chọn theo tiêu chí</h3>
            <ButtonRenderer
              type={type}
              appliedFilters={appliedFilters}
              handleFilterClick={handleFilterClick}
              renderDropdownContent={renderDropdownContent}
            />
          </div>
        )}
      </div>
    </div>
  );
}
```

### 2. useFilterHandlers Hook

```typescript
// apps/web/components/breadcrumb-filter/hooks/useFilterHandlers.ts
import { useState } from 'react';

export interface FilterState {
  appliedFilters: any;
  showPriceDropdown: boolean;
  showRangeDropdown: boolean;
  showBrandDropdown: boolean;
  showCapacityDropdown: boolean;
  showCyclesDropdown: boolean;
  showHealthDropdown: boolean;
  showBatteryBrandDropdown: boolean;
}

export function useFilterHandlers(onFilterChange?: (filters: any) => void) {
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showCapacityDropdown, setShowCapacityDropdown] = useState(false);
  const [showCyclesDropdown, setShowCyclesDropdown] = useState(false);
  const [showHealthDropdown, setShowHealthDropdown] = useState(false);
  const [showBatteryBrandDropdown, setShowBatteryBrandDropdown] = useState(false);

  // Handle filter changes
  const updateFilters = (newFilterData: any) => {
    const newFilters = { ...appliedFilters, ...newFilterData };
    setAppliedFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handlePriceApply = (priceRange: { min: number | null; max: number | null }) => {
    if (priceRange.min === null && priceRange.max === null) {
      // Clear price filter
      const newFilters = { ...appliedFilters };
      delete newFilters.priceMin;
      delete newFilters.priceMax;
      setAppliedFilters(newFilters);
      onFilterChange?.(newFilters);
    } else {
      updateFilters({ priceMin: priceRange.min, priceMax: priceRange.max });
    }
  };

  const handleRangeApply = (range: string) => {
    if (range === '') {
      const newFilters = { ...appliedFilters };
      delete newFilters.range;
      setAppliedFilters(newFilters);
      onFilterChange?.(newFilters);
    } else {
      updateFilters({ range });
    }
  };

  const handleBrandApply = (brand: string) => {
    if (brand === '') {
      const newFilters = { ...appliedFilters };
      delete newFilters.brand;
      setAppliedFilters(newFilters);
      onFilterChange?.(newFilters);
    } else {
      updateFilters({ brand });
    }
  };

  const handleCapacityApply = (capacity: string) => {
    if (capacity === '') {
      const newFilters = { ...appliedFilters };
      delete newFilters.capacity;
      setAppliedFilters(newFilters);
      onFilterChange?.(newFilters);
    } else {
      updateFilters({ capacity });
    }
  };

  const handleCyclesApply = (cycles: string) => {
    if (cycles === '') {
      const newFilters = { ...appliedFilters };
      delete newFilters.cycles;
      setAppliedFilters(newFilters);
      onFilterChange?.(newFilters);
    } else {
      updateFilters({ cycles });
    }
  };

  const handleHealthApply = (health: string) => {
    if (health === '') {
      const newFilters = { ...appliedFilters };
      delete newFilters.health;
      setAppliedFilters(newFilters);
      onFilterChange?.(newFilters);
    } else {
      updateFilters({ health });
    }
  };

  const handleBatteryBrandApply = (brand: string) => {
    if (brand === '') {
      const newFilters = { ...appliedFilters };
      delete newFilters.batteryBrand;
      setAppliedFilters(newFilters);
      onFilterChange?.(newFilters);
    } else {
      updateFilters({ batteryBrand: brand });
    }
  };

  const handleFilterClick = (filterKey: string) => {
    // Toggle dropdown based on filter key
    switch (filterKey) {
      case 'price':
        setShowPriceDropdown(!showPriceDropdown);
        // Close other dropdowns
        setShowRangeDropdown(false);
        setShowBrandDropdown(false);
        setShowCapacityDropdown(false);
        setShowCyclesDropdown(false);
        setShowHealthDropdown(false);
        setShowBatteryBrandDropdown(false);
        break;
      case 'range':
        setShowRangeDropdown(!showRangeDropdown);
        setShowPriceDropdown(false);
        setShowBrandDropdown(false);
        setShowCapacityDropdown(false);
        setShowCyclesDropdown(false);
        setShowHealthDropdown(false);
        setShowBatteryBrandDropdown(false);
        break;
      case 'brand':
        setShowBrandDropdown(!showBrandDropdown);
        setShowPriceDropdown(false);
        setShowRangeDropdown(false);
        setShowCapacityDropdown(false);
        setShowCyclesDropdown(false);
        setShowHealthDropdown(false);
        setShowBatteryBrandDropdown(false);
        break;
      case 'capacity':
        setShowCapacityDropdown(!showCapacityDropdown);
        setShowPriceDropdown(false);
        setShowRangeDropdown(false);
        setShowBrandDropdown(false);
        setShowCyclesDropdown(false);
        setShowHealthDropdown(false);
        setShowBatteryBrandDropdown(false);
        break;
      case 'cycles':
        setShowCyclesDropdown(!showCyclesDropdown);
        setShowPriceDropdown(false);
        setShowRangeDropdown(false);
        setShowBrandDropdown(false);
        setShowCapacityDropdown(false);
        setShowHealthDropdown(false);
        setShowBatteryBrandDropdown(false);
        break;
      case 'health':
        setShowHealthDropdown(!showHealthDropdown);
        setShowPriceDropdown(false);
        setShowRangeDropdown(false);
        setShowBrandDropdown(false);
        setShowCapacityDropdown(false);
        setShowCyclesDropdown(false);
        setShowBatteryBrandDropdown(false);
        break;
      case 'batteryBrand':
        setShowBatteryBrandDropdown(!showBatteryBrandDropdown);
        setShowPriceDropdown(false);
        setShowRangeDropdown(false);
        setShowBrandDropdown(false);
        setShowCapacityDropdown(false);
        setShowCyclesDropdown(false);
        setShowHealthDropdown(false);
        break;
      default:
        break;
    }
  };

  return {
    appliedFilters,
    showPriceDropdown,
    showRangeDropdown,
    showBrandDropdown,
    showCapacityDropdown,
    showCyclesDropdown,
    showHealthDropdown,
    showBatteryBrandDropdown,
    setShowPriceDropdown,
    setShowRangeDropdown,
    setShowBrandDropdown,
    setShowCapacityDropdown,
    setShowCyclesDropdown,
    setShowHealthDropdown,
    setShowBatteryBrandDropdown,
    handlePriceApply,
    handleRangeApply,
    handleBrandApply,
    handleCapacityApply,
    handleCyclesApply,
    handleHealthApply,
    handleBatteryBrandApply,
    handleFilterClick,
  };
}
```

### 3. DropdownManager Component

```typescript
// apps/web/components/breadcrumb-filter/components/DropdownManager.tsx
'use client';

import React from 'react';
import { PriceFilterDropdown } from '../PriceFilterDropdown';
import { RangeFilterDropdown } from '../RangeFilterDropdown';
import { BrandFilterDropdown } from '../BrandFilterDropdown';
import { CapacityFilterDropdown } from '../CapacityFilterDropdown';
import { CyclesFilterDropdown } from '../CyclesFilterDropdown';
import { HealthFilterDropdown } from '../HealthFilterDropdown';
import { BatteryBrandFilterDropdown } from '../BatteryBrandFilterDropdown';
import { FILTER_LABELS } from '../constants/filterConstants';

interface DropdownManagerProps {
  showPriceDropdown: boolean;
  showRangeDropdown: boolean;
  showBrandDropdown: boolean;
  showCapacityDropdown: boolean;
  showCyclesDropdown: boolean;
  showHealthDropdown: boolean;
  showBatteryBrandDropdown: boolean;
  appliedFilters: any;
  setShowPriceDropdown: (show: boolean) => void;
  setShowRangeDropdown: (show: boolean) => void;
  setShowBrandDropdown: (show: boolean) => void;
  setShowCapacityDropdown: (show: boolean) => void;
  setShowCyclesDropdown: (show: boolean) => void;
  setShowHealthDropdown: (show: boolean) => void;
  setShowBatteryBrandDropdown: (show: boolean) => void;
  handlePriceApply: (priceRange: { min: number; max: number }) => void;
  handleRangeApply: (range: string) => void;
  handleBrandApply: (brand: string) => void;
  handleCapacityApply: (capacity: string) => void;
  handleCyclesApply: (cycles: string) => void;
  handleHealthApply: (health: string) => void;
  handleBatteryBrandApply: (brand: string) => void;
}

export function DropdownManager({
  showPriceDropdown,
  showRangeDropdown,
  showBrandDropdown,
  showCapacityDropdown,
  showCyclesDropdown,
  showHealthDropdown,
  showBatteryBrandDropdown,
  appliedFilters,
  setShowPriceDropdown,
  setShowRangeDropdown,
  setShowBrandDropdown,
  setShowCapacityDropdown,
  setShowCyclesDropdown,
  setShowHealthDropdown,
  setShowBatteryBrandDropdown,
  handlePriceApply,
  handleRangeApply,
  handleBrandApply,
  handleCapacityApply,
  handleCyclesApply,
  handleHealthApply,
  handleBatteryBrandApply
}: DropdownManagerProps) {
  // Helper function to render dropdown content
  const renderDropdownContent = (buttonLabel: string) => {
    const dropdownMap = {
      [FILTER_LABELS.PRICE]: {
        show: showPriceDropdown,
        component: PriceFilterDropdown,
        props: {
          onApply: handlePriceApply,
          onClose: () => setShowPriceDropdown(false),
          currentRange: {
            min: appliedFilters.priceMin || 0,
            max: appliedFilters.priceMax || 1000000000
          }
        }
      },
      [FILTER_LABELS.BRAND]: {
        show: showBrandDropdown,
        component: BrandFilterDropdown,
        props: {
          onApply: handleBrandApply,
          onClose: () => setShowBrandDropdown(false),
          currentBrand: appliedFilters.brand || ''
        }
      },
      [FILTER_LABELS.RANGE]: {
        show: showRangeDropdown,
        component: RangeFilterDropdown,
        props: {
          onApply: handleRangeApply,
          onClose: () => setShowRangeDropdown(false),
          currentRange: appliedFilters.range || ''
        }
      },
      [FILTER_LABELS.CAPACITY]: {
        show: showCapacityDropdown,
        component: CapacityFilterDropdown,
        props: {
          onApply: handleCapacityApply,
          onClose: () => setShowCapacityDropdown(false),
          currentCapacity: appliedFilters.capacity || ''
        }
      },
      [FILTER_LABELS.CYCLES]: {
        show: showCyclesDropdown,
        component: CyclesFilterDropdown,
        props: {
          onApply: handleCyclesApply,
          onClose: () => setShowCyclesDropdown(false),
          currentCycles: appliedFilters.cycles || ''
        }
      },
      [FILTER_LABELS.HEALTH]: {
        show: showHealthDropdown,
        component: HealthFilterDropdown,
        props: {
          onApply: handleHealthApply,
          onClose: () => setShowHealthDropdown(false),
          currentHealth: appliedFilters.health || ''
        }
      },
      [FILTER_LABELS.BATTERY_BRAND]: {
        show: showBatteryBrandDropdown,
        component: BatteryBrandFilterDropdown,
        props: {
          onApply: handleBatteryBrandApply,
          onClose: () => setShowBatteryBrandDropdown(false),
          currentBrand: appliedFilters.batteryBrand || ''
        }
      },
    };

    const dropdownConfig = dropdownMap[buttonLabel as keyof typeof dropdownMap];
    
    if (!dropdownConfig || !dropdownConfig.show) {
      return null;
    }

    const Component = dropdownConfig.component;
    return <Component {...dropdownConfig.props} />;
  };

  return { renderDropdownContent };
}
```

### 4. ButtonRenderer Component

```typescript
// apps/web/components/breadcrumb-filter/components/ButtonRenderer.tsx
'use client';

import React from 'react';
import { FilterButton } from '../FilterButton';
import { evFilterButtons } from '../EvFilters';
import { batteryFilterButtons } from '../BatteryFilters';
import { LABEL_TO_FILTER_KEY } from '../constants/filterConstants';

interface ButtonRendererProps {
  type: 'battery' | 'ev';
  appliedFilters: any;
  handleFilterClick: (filterKey: string) => void;
  renderDropdownContent: (buttonLabel: string) => React.ReactNode;
}

export function ButtonRenderer({
  type,
  appliedFilters,
  handleFilterClick,
  renderDropdownContent
}: ButtonRendererProps) {
  // Get filter buttons based on type
  const filterButtons = type === 'battery' ? batteryFilterButtons : evFilterButtons;

  // Helper function to check if a filter is applied
  const isFilterApplied = (filterKey: string): boolean => {
    switch (filterKey) {
      case 'price':
        return !!(appliedFilters.priceMin && appliedFilters.priceMax);
      case 'brand':
        return !!appliedFilters.brand;
      case 'capacity':
        return !!appliedFilters.capacity;
      case 'cycles':
        return !!appliedFilters.cycles;
      case 'health':
        return !!appliedFilters.health;
      case 'batteryBrand':
        return !!appliedFilters.batteryBrand;
      case 'range':
        return !!appliedFilters.range;
      case 'new-arrivals':
        return !!appliedFilters.sortBy;
      default:
        return false;
    }
  };

  // Update button states with applied filters
  const buttonsWithState = filterButtons.map(button => {
    const filterKey = LABEL_TO_FILTER_KEY[button.label] || 'all';

    return {
      ...button,
      isActive: isFilterApplied(filterKey),
      onClick: () => handleFilterClick(filterKey)
    };
  });

  return (
    <div className="flex flex-wrap gap-3">
      {buttonsWithState.map((button, index) => (
        <FilterButton
          key={index}
          label={button.label}
          icon={button.icon}
          isActive={button.isActive}
          hasDropdown={button.hasDropdown}
          hasInfo={button.hasInfo}
          onClick={button.onClick}
        >
          {renderDropdownContent(button.label)}
        </FilterButton>
      ))}
    </div>
  );
}
```

### 5. Filter Dropdown Components

#### PriceFilterDropdown
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
    onApply({ min: null, max: null });
    onClose();
  };

  return (
    <div className="w-80 bg-white border border-emerald-600 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">{DROPDOWN_TITLES.PRICE}</h3>
          
          {/* Price range inputs and sliders */}
          {/* ... implementation details ... */}
          
          <DropdownButtons onApply={handleApply} onClear={handleClear} />
        </div>
      </div>
    </div>
  );
}
```

### 6. Filter Constants

```typescript
// apps/web/components/breadcrumb-filter/constants/filterConstants.ts
export const FILTER_LABELS = {
  PRICE: 'Giá',
  RANGE: 'Quãng đường',
  BRAND: 'Thương hiệu',
  CAPACITY: 'Dung lượng',
  CYCLES: 'Số chu kỳ',
  HEALTH: 'Tình trạng pin',
  BATTERY_BRAND: 'Thương hiệu pin',
  NEW_ARRIVALS: 'Mới nhất',
} as const;

export const LABEL_TO_FILTER_KEY: Record<string, string> = {
  [FILTER_LABELS.PRICE]: 'price',
  [FILTER_LABELS.RANGE]: 'range',
  [FILTER_LABELS.BRAND]: 'brand',
  [FILTER_LABELS.CAPACITY]: 'capacity',
  [FILTER_LABELS.CYCLES]: 'cycles',
  [FILTER_LABELS.HEALTH]: 'health',
  [FILTER_LABELS.BATTERY_BRAND]: 'batteryBrand',
  [FILTER_LABELS.NEW_ARRIVALS]: 'new-arrivals',
};
```

### 7. Usage Example

```typescript
// apps/web/app/(public)/posts/ev/page.tsx
import { FilterButtons } from '@/components/breadcrumb-filter/FilterButtons';

export default function EvPostsPage() {
  const handleFilterChange = (filters: any) => {
    // Apply filters to post list
    console.log('Applied filters:', filters);
    // Refetch posts with new filters
  };

  return (
    <div>
      <SearchBar />
      <FilterButtons
        type="ev"
        onFilterChange={handleFilterChange}
        showFilters={true}
      />
      {/* Post list */}
    </div>
  );
}
```

### Key Features:
- ✅ **Multiple Filter Types**: Price, Range, Brand, Capacity, Cycles, Health, Battery Brand
- ✅ **State Management**: Centralized filter state with useFilterHandlers hook
- ✅ **Dropdown Management**: Only one dropdown open at a time
- ✅ **Filter Status**: Visual indication when filter is applied
- ✅ **Clear Filters**: Ability to clear individual filters
- ✅ **Type Support**: Supports both EV and Battery filter types
- ✅ **Reusable Components**: Modular design for easy maintenance

