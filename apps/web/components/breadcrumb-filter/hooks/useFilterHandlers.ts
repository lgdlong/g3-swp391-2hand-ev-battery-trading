'use client';

import { useState } from 'react';

export interface FilterState {
  activeFilter: string;
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
  const [activeFilter, setActiveFilter] = useState('all');
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

  const handlePriceApply = (priceRange: { min: number; max: number }) => {
    updateFilters({ priceMin: priceRange.min, priceMax: priceRange.max });
  };

  const handleRangeApply = (range: string) => {
    updateFilters({ range });
  };

  const handleBrandApply = (brand: string) => {
    updateFilters({ brand });
  };

  const handleCapacityApply = (capacity: string) => {
    updateFilters({ capacity });
  };

  const handleCyclesApply = (cycles: string) => {
    updateFilters({ cycles });
  };

  const handleHealthApply = (health: string) => {
    updateFilters({ health });
  };

  const handleBatteryBrandApply = (brand: string) => {
    updateFilters({ batteryBrand: brand });
  };

  const handleClearAllFilters = () => {
    setAppliedFilters({});
    setActiveFilter('all');
    // Close all dropdowns
    setShowPriceDropdown(false);
    setShowRangeDropdown(false);
    setShowBrandDropdown(false);
    setShowCapacityDropdown(false);
    setShowCyclesDropdown(false);
    setShowHealthDropdown(false);
    setShowBatteryBrandDropdown(false);
    onFilterChange?.({});
  };

  const handleFilterClick = (filterKey: string) => {
    if (filterKey === 'available') {
      setActiveFilter('available');
      updateFilters({ status: 'available' });
    } else if (filterKey === 'new-arrivals') {
      setActiveFilter('new-arrivals');
      updateFilters({ sortBy: 'newest' });
    } else {
      // Handle dropdown toggles
      const dropdownStates = {
        price: setShowPriceDropdown,
        brand: setShowBrandDropdown,
        capacity: setShowCapacityDropdown,
        cycles: setShowCyclesDropdown,
        health: setShowHealthDropdown,
        batteryBrand: setShowBatteryBrandDropdown,
        range: setShowRangeDropdown,
      };

      const currentDropdownSetter = dropdownStates[filterKey as keyof typeof dropdownStates];
      if (currentDropdownSetter) {
        setActiveFilter(filterKey);
        currentDropdownSetter((prev) => !prev);

        // Close all other dropdowns
        Object.entries(dropdownStates).forEach(([key, setter]) => {
          if (key !== filterKey) {
            setter(false);
          }
        });
      }
    }
  };

  return {
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
    handleClearAllFilters,
    handleFilterClick
  };
}
