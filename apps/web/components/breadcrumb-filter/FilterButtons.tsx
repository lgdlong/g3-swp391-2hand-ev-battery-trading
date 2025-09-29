'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { BreadcrumbFilter } from './BreadcrumbFilter';
import { FilterButton } from './FilterButton';
import { evFilterButtons } from './EvFilters';
import { batteryFilterButtons } from './BatteryFilters';
import { useBreadcrumb } from './useBreadcrumb';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface FilterButtonsProps {
  className?: string;
  breadcrumbItems?: BreadcrumbItem[];
  type?: 'battery' | 'ev';
  initialCategory?: string;
  initialSubcategory?: string;
  onSubcategoryChange?: (setSubcategory: (subcategory: string) => void) => void;
}

export function FilterButtons({
  className,
  breadcrumbItems = [],
  type = 'ev',
  initialCategory,
  initialSubcategory,
  onSubcategoryChange
}: FilterButtonsProps) {
  const [activeFilter, setActiveFilter] = useState('all');

  // Use breadcrumb hook
  const { breadcrumbState, setCategory, setSubcategory } = useBreadcrumb(type);

  // Initialize breadcrumb on mount
  React.useEffect(() => {
    const category = initialCategory || (type === 'ev' ? 'Xe điện' : 'Pin EV');
    setCategory(category);
    if (initialSubcategory) {
      setSubcategory(initialSubcategory);
    }
  }, [initialCategory, initialSubcategory, setCategory, setSubcategory, type]);

  // Expose setSubcategory to parent
  React.useEffect(() => {
    if (onSubcategoryChange) {
      onSubcategoryChange(setSubcategory);
    }
  }, [onSubcategoryChange, setSubcategory]);

  // Use internal breadcrumb if no external breadcrumbItems provided
  const displayBreadcrumbItems = breadcrumbItems.length > 0 ? breadcrumbItems : breadcrumbState.items;

  // Get filter buttons based on type
  const filterButtons = type === 'battery' ? batteryFilterButtons : evFilterButtons;

  // Update button states with active filter
  const buttonsWithState = filterButtons.map(button => ({
    ...button,
    isActive: button.label === 'Bộ lọc' ? activeFilter === 'all' :
              button.label === 'Sẵn hàng' ? activeFilter === 'available' :
              button.label === 'Hàng mới về' ? activeFilter === 'new-arrivals' :
              button.label === 'Xem theo giá' ? activeFilter === 'price' :
              button.label === 'Nhu cầu sử dụng' ? activeFilter === 'usage' :
              button.label === 'Quãng đường di chuyển' ? activeFilter === 'range' :
              button.label === 'Dung lượng pin' ? activeFilter === 'capacity' :
              button.label === 'Tình trạng pin' ? activeFilter === 'health' :
              button.label === 'Số chu kỳ' ? activeFilter === 'cycles' :
              button.label === 'Thương hiệu' ? activeFilter === 'brand' : false,
    onClick: () => {
      const filterKey = button.label === 'Bộ lọc' ? 'all' :
                       button.label === 'Sẵn hàng' ? 'available' :
                       button.label === 'Hàng mới về' ? 'new-arrivals' :
                       button.label === 'Xem theo giá' ? 'price' :
                       button.label === 'Nhu cầu sử dụng' ? 'usage' :
                       button.label === 'Quãng đường di chuyển' ? 'range' :
                       button.label === 'Dung lượng pin' ? 'capacity' :
                       button.label === 'Tình trạng pin' ? 'health' :
                       button.label === 'Số chu kỳ' ? 'cycles' :
                       button.label === 'Thương hiệu' ? 'brand' : 'all';
      setActiveFilter(filterKey);
    }
  }));

  return (
    <div className={cn('w-full bg-white border-b border-gray-200', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {displayBreadcrumbItems.length > 0 && (
          <div className="mb-4 px-2">
            <BreadcrumbFilter items={displayBreadcrumbItems} />
          </div>
        )}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Chọn theo tiêu chí</h3>
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
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
