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
      // Clear price filter by removing the keys
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
      // Clear range filter
      const newFilters = { ...appliedFilters };
      delete newFilters.range;
      setAppliedFilters(newFilters);
      onFilterChange?.(newFilters);
    } else {
      updateFilters({ range });
    }
  };

  const handleBrandApply = (brandId: number | null) => {
    if (brandId === null) {
      // Clear brand filter
      const newFilters = { ...appliedFilters };
      delete newFilters.brandId;
      setAppliedFilters(newFilters);
      onFilterChange?.(newFilters);
    } else {
      updateFilters({ brandId });
    }
  };

  const handleCapacityApply = (capacity: string) => {
    if (capacity === '') {
      // Clear capacity filter
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
      // Clear cycles filter
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
      // Clear health filter
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
      // Clear battery brand filter
      const newFilters = { ...appliedFilters };
      delete newFilters.batteryBrand;
      setAppliedFilters(newFilters);
      onFilterChange?.(newFilters);
    } else {
      updateFilters({ batteryBrand: brand });
    }
  };

  const handleClearAllFilters = () => {
    setAppliedFilters({});
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
    if (filterKey === 'new-arrivals') {
      // For new-arrivals, apply immediately since no dropdown
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
    handleFilterClick,
  };
}
