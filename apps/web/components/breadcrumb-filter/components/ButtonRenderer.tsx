'use client';

import React from 'react';
import { FilterButton } from '../FilterButton';
import { evFilterButtons } from '../EvFilters';
import { batteryFilterButtons } from '../BatteryFilters';
import { LABEL_TO_FILTER_KEY } from '@/config/constants/filterConstants';

interface ButtonRendererProps {
  type: 'ev' | 'battery';
  activeFilter: string;
  handleFilterClick: (filterKey: string) => void;
  renderDropdownContent: (buttonLabel: string) => React.ReactNode;
}

export function ButtonRenderer({
  type,
  activeFilter,
  handleFilterClick,
  renderDropdownContent,
}: ButtonRendererProps) {
  // Get filter buttons based on type
  const filterButtons = type === 'battery' ? batteryFilterButtons : evFilterButtons;

  // Update button states with active filter
  const buttonsWithState = filterButtons.map((button) => {
    const filterKey = LABEL_TO_FILTER_KEY[button.label] || 'all';

    return {
      ...button,
      isActive: activeFilter === filterKey,
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
