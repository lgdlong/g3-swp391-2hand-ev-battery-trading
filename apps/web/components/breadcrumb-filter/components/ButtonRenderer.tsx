'use client';

import React from 'react';
import { FilterButton } from '../FilterButton';
import { evFilterButtons } from '../EvFilters';
import { batteryFilterButtons } from '../BatteryFilters';
import { LABEL_TO_FILTER_KEY } from '../constants/filterConstants';

interface ButtonRendererProps {
  type: 'ev' | 'battery';
  appliedFilters: any;
  handleFilterClick: (filterKey: string) => void;
  renderDropdownContent: (buttonLabel: string) => React.ReactNode;
}

export function ButtonRenderer({
  type,
  appliedFilters,
  handleFilterClick,
  renderDropdownContent,
}: ButtonRendererProps) {
  // Get filter buttons based on type
  const filterButtons = type === 'battery' ? batteryFilterButtons : evFilterButtons;

  // Helper function to check if a filter is applied
  const isFilterApplied = (filterKey: string): boolean => {
    switch (filterKey) {
      case 'price':
        return !!(appliedFilters.priceMin || appliedFilters.priceMax);
      case 'brand':
        return !!appliedFilters.brandId;
      case 'odoKm':
        return !!appliedFilters.odoKm;
      case 'capacity':
        return !!appliedFilters.capacity;
      case 'cycles':
        return !!appliedFilters.cycles;
      case 'batteryBrand':
        return !!appliedFilters.batteryBrand;
      case 'new-arrivals':
        return !!appliedFilters.sortBy;
      default:
        return false;
    }
  };

  // Update button states with applied filters
  const buttonsWithState = filterButtons.map((button) => {
    const filterKey = LABEL_TO_FILTER_KEY[button.label] || 'all';

    return {
      ...button,
      isActive: isFilterApplied(filterKey),
      onClick: () => handleFilterClick(filterKey),
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
