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
  onFilterChange
}: FilterButtonsProps) {
  // Use breadcrumb hook
  const { breadcrumbState, setCategory, setSubcategory } = useBreadcrumb(type);

  // Use filter handlers hook
  const {
    activeFilter,
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
    handleFilterClick
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
    handleBatteryBrandApply
  });

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
  return (
    <div className={cn('w-full bg-white rounded-xl border-gray-200', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {displayBreadcrumbItems.length > 0 && (
          <div className="mb-4 px-2">
            <BreadcrumbFilter items={displayBreadcrumbItems} />
          </div>
        )}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Chọn theo tiêu chí</h3>
          <ButtonRenderer
            type={type}
            activeFilter={activeFilter}
            handleFilterClick={handleFilterClick}
            renderDropdownContent={renderDropdownContent}
          />
        </div>
      </div>
    </div>
  );
}
