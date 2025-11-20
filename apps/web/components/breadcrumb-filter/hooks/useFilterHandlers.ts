import { useState } from 'react';

export interface FilterState {
  appliedFilters: any;
  showPriceDropdown: boolean;
  showOdoKmDropdown: boolean;
  showBrandDropdown: boolean;
  showCapacityDropdown: boolean;
  showCyclesDropdown: boolean;
  showBatteryBrandDropdown: boolean;
}

export function useFilterHandlers(onFilterChange?: (filters: any) => void) {
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showOdoKmDropdown, setShowOdoKmDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showCapacityDropdown, setShowCapacityDropdown] = useState(false);
  const [showCyclesDropdown, setShowCyclesDropdown] = useState(false);
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

  const handleOdoKmApply = (odoKm: string) => {
    if (odoKm === '') {
      // Clear odoKm filter
      const newFilters = { ...appliedFilters };
      delete newFilters.odoKm;
      setAppliedFilters(newFilters);
      onFilterChange?.(newFilters);
    } else {
      updateFilters({ odoKm });
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
    setShowOdoKmDropdown(false);
    setShowBrandDropdown(false);
    setShowCapacityDropdown(false);
    setShowCyclesDropdown(false);
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
        batteryBrand: setShowBatteryBrandDropdown,
        odoKm: setShowOdoKmDropdown,
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
    showOdoKmDropdown,
    showBrandDropdown,
    showCapacityDropdown,
    showCyclesDropdown,
    showBatteryBrandDropdown,
    setShowPriceDropdown,
    setShowOdoKmDropdown,
    setShowBrandDropdown,
    setShowCapacityDropdown,
    setShowCyclesDropdown,
    setShowBatteryBrandDropdown,
    handlePriceApply,
    handleOdoKmApply,
    handleBrandApply,
    handleCapacityApply,
    handleCyclesApply,
    handleBatteryBrandApply,
    handleClearAllFilters,
    handleFilterClick,
  };
}
