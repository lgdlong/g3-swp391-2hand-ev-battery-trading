# FilterButton Component - Q&A

## Question: Create Reusable FilterButton Component

**Prompt:**
Tôi cần tạo một component FilterButton có thể tái sử dụng để hiển thị các nút filter với các tính năng:
- Hiển thị label và icon
- Trạng thái active/inactive
- Dropdown indicator
- Info icon
- Click handler
- Hiển thị dropdown content khi click

**Answer:**

### FilterButton Component

```typescript
// apps/web/components/breadcrumb-filter/FilterButton.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FilterButtonProps {
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  hasDropdown?: boolean;
  hasInfo?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function FilterButton({
  label,
  icon,
  isActive,
  hasDropdown,
  hasInfo,
  onClick,
  children
}: FilterButtonProps) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium',
          isActive
            ? 'border-emerald-500 text-emerald-600 bg-emerald-50 shadow-sm' // Nút được chọn - màu xanh lá
            : 'border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
        )}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{label}</span>
        {hasDropdown && (
          <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
        {hasInfo && (
          <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8h.01" />
          </svg>
        )}
      </button>
      {children && (
        <div className="absolute top-full left-0 mt-1 z-50">
          {children}
        </div>
      )}
    </div>
  );
}
```

### Key Features:
- ✅ **Visual States**: Active state với màu xanh lá (emerald), inactive với màu xám
- ✅ **Icons Support**: Hiển thị icon tùy chọn bên cạnh label
- ✅ **Dropdown Indicator**: Mũi tên xuống khi có dropdown
- ✅ **Info Icon**: Icon thông tin (i) khi cần
- ✅ **Click Handler**: Xử lý click event
- ✅ **Dropdown Content**: Hiển thị children (dropdown content) khi click
- ✅ **Positioning**: Absolute positioning cho dropdown với z-index cao
- ✅ **Hover Effects**: Transition và hover states
- ✅ **Responsive**: Flex layout với gap spacing

### Usage Example:

```typescript
<FilterButton
  label="Giá"
  icon={<DollarSign className="h-4 w-4" />}
  isActive={appliedFilters.priceMin && appliedFilters.priceMax}
  hasDropdown={true}
  hasInfo={true}
  onClick={() => handleFilterClick('price')}
>
  {showPriceDropdown && (
    <PriceFilterDropdown
      onApply={handlePriceApply}
      onClose={() => setShowPriceDropdown(false)}
      currentRange={{
        min: appliedFilters.priceMin || 0,
        max: appliedFilters.priceMax || 1000000000
      }}
    />
  )}
</FilterButton>
```

